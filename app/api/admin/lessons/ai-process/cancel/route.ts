/**
 * POST /api/admin/lessons/ai-process/cancel
 *
 * Body: { jobId: string }
 *
 * Sets `cancelRequested: true` on `aiJobs/{jobId}`. The running worker
 * polls this flag every second, aborts in-flight HTTP, kills ffmpeg and
 * exits with status `cancelled`. If the worker is already gone (for
 * example because the lambda was killed) we mark the job as cancelled
 * directly here so the UI doesn't get stuck.
 */

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface CancelBody {
    jobId?: string;
}

export async function POST(req: NextRequest) {
    const { requireAdmin } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    let body: CancelBody;
    try {
        body = (await req.json()) as CancelBody;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const jobId = body.jobId?.trim();
    if (!jobId) {
        return NextResponse.json({ error: 'Missing required field: jobId' }, { status: 400 });
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
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    }

    const db = getFirestore();
    const jobRef = db.doc(`aiJobs/${jobId}`);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    const job = jobSnap.data() as {
        status?: string;
        courseId?: string;
        lessonId?: string;
        heartbeatAt?: number;
    };

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        return NextResponse.json(
            { success: true, status: job.status, alreadyTerminal: true },
            { status: 200 }
        );
    }

    // Always set the flag — the worker poller will pick it up and abort.
    await jobRef.update({
        cancelRequested: true,
        message: 'Cancellation requested…',
    });

    // If the worker has been silent for >30s assume the lambda is dead and
    // mark the job as cancelled ourselves so the UI is not stuck.
    const stale = job.heartbeatAt && Date.now() - job.heartbeatAt > 30_000;
    if (stale) {
        await jobRef.update({
            status: 'cancelled',
            stage: 'cancelled',
            message: 'Cancelled by admin (worker was unresponsive).',
            error: 'Cancelled by admin',
            finishedAt: Date.now(),
            cancelRequested: false,
        });
        if (job.courseId && job.lessonId) {
            try {
                await db.doc(`courses/${job.courseId}/lessons/${job.lessonId}`).update({
                    aiProcessingStatus: 'cancelled',
                    aiProcessingError: 'Cancelled by admin',
                    captionsProcessing: false,
                    currentAiJobId: FieldValue.delete(),
                });
            } catch {
                /* ignore */
            }
        }
    }

    console.log('[ai-process/cancel] requested', { jobId, stale });
    return NextResponse.json({ success: true, stale });
}
