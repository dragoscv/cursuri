/**
 * POST /api/admin/lessons/ai-process/cancel
 *
 * Admin-only. Sets the `aiProcessingCancelRequested` flag on a lesson so the
 * long-running ai-process route can stop at its next checkpoint.
 *
 * Body: { courseId: string, lessonId: string }
 */

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface CancelBody {
    courseId?: string;
    lessonId?: string;
}

export async function POST(req: NextRequest) {
    const { requireAdmin } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    let body: CancelBody;
    try {
        body = (await req.json()) as CancelBody;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const courseId = body.courseId?.trim();
    const lessonId = body.lessonId?.trim();
    if (!courseId || !lessonId) {
        return NextResponse.json(
            { error: 'Missing required fields: courseId, lessonId' },
            { status: 400 }
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
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    }

    const db = getFirestore();
    const lessonRef = db.doc(`courses/${courseId}/lessons/${lessonId}`);
    const lessonSnap = await lessonRef.get();
    if (!lessonSnap.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    const data = lessonSnap.data() || {};
    if (data.aiProcessingStatus !== 'processing') {
        return NextResponse.json(
            { error: 'No AI generation is currently running on this lesson.' },
            { status: 409 }
        );
    }

    await lessonRef.update({
        aiProcessingCancelRequested: true,
        aiProcessingMessage: 'Cancellation requested\u2026',
    });

    console.log('[ai-process/cancel] flagged', { courseId, lessonId });

    return NextResponse.json({ success: true });
}
