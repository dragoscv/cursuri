/**
 * POST /api/admin/lessons/ai-process
 *
 * Enqueues a lesson AI processing job. The actual long-running pipeline runs
 * in this same serverless invocation via Next.js `after()` so the HTTP
 * response returns immediately with the new `jobId` while the worker keeps
 * processing in the background. Each enqueue is its own invocation, so
 * multiple jobs (across different lessons) run truly in parallel.
 *
 * Body: { courseId: string, lessonId: string, videoUrl?: string, language?: string }
 * Returns 202 with { jobId, status: 'queued' }.
 *
 * Cancellation, progress and final results all live on `aiJobs/{jobId}` —
 * the modal and the global tray subscribe to that document directly.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300; // long enough for Fast Transcription on multi-GB lessons

interface AiProcessBody {
    courseId?: string;
    lessonId?: string;
    videoUrl?: string;
    language?: string;
}

export async function POST(req: NextRequest) {
    const { requireAdmin, checkRateLimit } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult.user!;

    const allowed = await checkRateLimit(`lesson-ai:${user.uid}`, 10, 60_000);
    if (!allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait a minute and try again.' },
            { status: 429 }
        );
    }

    let body: AiProcessBody;
    try {
        body = (await req.json()) as AiProcessBody;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const courseId = body.courseId?.trim();
    const lessonId = body.lessonId?.trim();
    const language = (body.language || 'en-US').trim();

    if (!courseId || !lessonId) {
        return NextResponse.json(
            { error: 'Missing required fields: courseId, lessonId' },
            { status: 400 }
        );
    }

    const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucketName) {
        console.error('[ai-process] missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
        return NextResponse.json(
            { error: 'Server is missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.' },
            { status: 503 }
        );
    }

    if (!getApps().length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
            return NextResponse.json(
                { error: 'Firebase Admin credentials are not fully configured on the server.' },
                { status: 503 }
            );
        }
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket: storageBucketName,
        });
    }

    const db = getFirestore();
    const lessonRef = db.doc(`courses/${courseId}/lessons/${lessonId}`);
    const lessonSnap = await lessonRef.get();
    if (!lessonSnap.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    const lessonData = lessonSnap.data() || {};
    const videoUrl: string = body.videoUrl || lessonData.file || lessonData.videoUrl;
    if (!videoUrl) {
        return NextResponse.json(
            {
                error:
                    'Lesson has no uploaded video URL (lesson.file). Upload a video before generating AI assets.',
            },
            { status: 400 }
        );
    }

    // Refuse to queue a second job if one is already active for this lesson.
    if (lessonData.currentAiJobId) {
        const existingSnap = await db.doc(`aiJobs/${lessonData.currentAiJobId}`).get();
        if (existingSnap.exists) {
            const ex = existingSnap.data() as { status?: string };
            if (ex?.status === 'queued' || ex?.status === 'processing') {
                return NextResponse.json(
                    {
                        error:
                            'An AI job is already running for this lesson. Cancel it from the AI Jobs tray first.',
                        jobId: lessonData.currentAiJobId,
                    },
                    { status: 409 }
                );
            }
        }
    }

    const jobId = uuidv4();
    const jobRef = db.doc(`aiJobs/${jobId}`);
    const now = Date.now();

    await jobRef.set({
        jobId,
        courseId,
        lessonId,
        lessonName: lessonData.name || lessonData.title || lessonId,
        videoUrl,
        language,
        status: 'queued',
        stage: 'queued',
        progress: 0,
        message: 'Queued for processing…',
        error: null,
        createdAt: now,
        startedAt: null,
        finishedAt: null,
        heartbeatAt: now,
        cancelRequested: false,
        createdBy: user.uid,
    });

    await lessonRef.update({
        currentAiJobId: jobId,
        aiProcessingStatus: 'processing',
        aiProcessingError: null,
        captionsProcessing: true,
    });

    console.log('[ai-process] enqueued', { jobId, courseId, lessonId, language });

    // Hand off to the Cloud Run worker. We do NOT await the pipeline; the
    // worker returns 202 immediately and continues processing in its own
    // long-running container. This keeps the Vercel function tiny and
    // avoids the /tmp + 60s + cross-instance issues that broke the
    // original `after(runAiJob)` design.
    const workerUrl = process.env.AUDIO_EXTRACTOR_URL;
    const workerToken = process.env.AUDIO_EXTRACTOR_TOKEN;
    if (!workerUrl || !workerToken) {
        await jobRef.update({
            status: 'failed',
            stage: 'failed',
            message: 'Server is missing AUDIO_EXTRACTOR_URL / AUDIO_EXTRACTOR_TOKEN.',
            error: 'Server is missing AUDIO_EXTRACTOR_URL / AUDIO_EXTRACTOR_TOKEN.',
            finishedAt: Date.now(),
        });
        return NextResponse.json(
            { error: 'Server is missing AUDIO_EXTRACTOR_URL / AUDIO_EXTRACTOR_TOKEN.' },
            { status: 503 }
        );
    }

    try {
        const fireRes = await fetch(`${workerUrl.replace(/\/$/, '')}/jobs/run`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${workerToken}`,
            },
            body: JSON.stringify({ jobId }),
            // Keep the call short: the worker just enqueues the job and returns 202.
            signal: AbortSignal.timeout(15_000),
        });
        if (!fireRes.ok) {
            const errText = await fireRes.text().catch(() => '');
            throw new Error(`worker returned ${fireRes.status} ${fireRes.statusText} ${errText}`.trim());
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('[ai-process] failed to fire worker', { jobId, error: message });
        await jobRef.update({
            status: 'failed',
            stage: 'failed',
            message: `Failed to start worker: ${message.slice(0, 200)}`,
            error: message.slice(0, 500),
            finishedAt: Date.now(),
        });
        await lessonRef.update({
            aiProcessingStatus: 'failed',
            aiProcessingError: message.slice(0, 500),
            captionsProcessing: false,
        });
        return NextResponse.json(
            { error: `Failed to start worker: ${message}` },
            { status: 502 }
        );
    }

    return NextResponse.json(
        { success: true, jobId, status: 'queued' },
        { status: 202 }
    );
}
