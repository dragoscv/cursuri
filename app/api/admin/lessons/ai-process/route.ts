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
import { after } from 'next/server';
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

    // Schedule the worker after the response is sent. Each enqueue runs in
    // its own serverless invocation, so jobs naturally parallelize.
    after(async () => {
        try {
            const { runAiJob } = await import('@/utils/ai/jobQueue');
            await runAiJob(jobId);
        } catch (e) {
            console.error('[ai-process] runAiJob threw at top level', e);
        }
    });

    return NextResponse.json(
        { success: true, jobId, status: 'queued' },
        { status: 202 }
    );
}
