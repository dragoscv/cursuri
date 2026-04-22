/**
 * POST /api/admin/lessons/translate/cancel
 * Body: { jobId: string }
 *
 * Sets `cancelRequested: true` on the translation job. The background
 * worker checks this flag between locales and bails out gracefully.
 */
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface Body {
    jobId?: string;
}

export async function POST(req: NextRequest) {
    const { requireAdmin } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    let body: Body;
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const jobId = body.jobId?.trim();
    if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    if (!getApps().length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
            return NextResponse.json(
                { error: 'Firebase Admin credentials are not configured.' },
                { status: 503 }
            );
        }
        initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    const db = getFirestore();
    await db.doc(`translationJobs/${jobId}`).update({ cancelRequested: true });
    return NextResponse.json({ ok: true });
}
