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

/**
 * GET /api/admin/users/github-accounts-summary
 * Aggregates per-user GitHub account counters for the admin users table.
 *
 * Definition of "healthy" mirrors the manual repair button: an account is
 * counted as healthy when isActive !== false AND orgMembershipStatus === 'added'.
 *
 * Response: { summary: { [userId]: { total: number, healthy: number } } }
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        initFirebaseAdmin();
        const db = getFirestore();

        const snap = await db.collectionGroup('githubAccounts').get();
        const summary: Record<string, { total: number; healthy: number }> = {};

        snap.forEach((doc) => {
            // path: users/{userId}/githubAccounts/{accountId}
            const userId = doc.ref.parent.parent?.id;
            if (!userId) return;
            const data = doc.data();
            const isActive = data.isActive !== false;
            const orgStatus = data.orgMembershipStatus as string | undefined;
            if (!summary[userId]) summary[userId] = { total: 0, healthy: 0 };
            summary[userId].total += 1;
            if (isActive && orgStatus === 'added') summary[userId].healthy += 1;
        });

        return NextResponse.json({ success: true, summary });
    } catch (error) {
        console.error('Error fetching github accounts summary:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch github accounts summary',
            },
            { status: 500 }
        );
    }
}
