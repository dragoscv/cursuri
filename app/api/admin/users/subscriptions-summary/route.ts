import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { requireAdmin } from '@/utils/api/auth';

function initFirebaseAdmin() {
    if (!getApps().length) {
        const hasCredentials = !!(
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY
        );
        if (hasCredentials) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID!,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
                }),
            });
        }
    }
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

/**
 * GET /api/admin/users/subscriptions-summary
 * Returns a per-user counter of total / active subscriptions for the user
 * management table. Active is defined as status in ('active','trialing').
 *
 * Response: { summary: { [userId]: { total: number, active: number } } }
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        initFirebaseAdmin();
        const db = getFirestore();

        const subsSnapshot = await db.collectionGroup('subscriptions').get();

        const summary: Record<string, { total: number; active: number }> = {};

        subsSnapshot.forEach((doc) => {
            // path: customers/{uid}/subscriptions/{subId}
            const userId = doc.ref.parent.parent?.id;
            if (!userId) return;
            const status = doc.data().status as string | undefined;
            if (!summary[userId]) summary[userId] = { total: 0, active: 0 };
            summary[userId].total += 1;
            if (status && ACTIVE_STATUSES.has(status)) summary[userId].active += 1;
        });

        return NextResponse.json({ success: true, summary });
    } catch (error) {
        console.error('Error fetching subscriptions summary:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : 'Failed to fetch subscriptions summary',
            },
            { status: 500 }
        );
    }
}
