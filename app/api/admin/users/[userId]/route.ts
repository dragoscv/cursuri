import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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
 * GET /api/admin/users/[userId]
 * Returns a single user profile (admin only). Combines Firestore profile + Firebase Auth record.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = await params;
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        initFirebaseAdmin();
        const db = getFirestore();
        const auth = getAuth();

        const [userDoc, authUser] = await Promise.all([
            db.collection('users').doc(userId).get(),
            auth.getUser(userId).catch(() => null),
        ]);

        if (!userDoc.exists && !authUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const profileData = userDoc.exists ? userDoc.data() : {};

        // Fetch enrollments subcollection
        const enrollmentsSnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('enrollments')
            .get();
        const enrollments: Record<string, unknown> = {};
        enrollmentsSnapshot.forEach((doc) => {
            enrollments[doc.id] = doc.data();
        });

        const user = {
            id: userId,
            email: authUser?.email || profileData?.email || null,
            displayName: authUser?.displayName || profileData?.displayName || null,
            photoURL: authUser?.photoURL || profileData?.photoURL || null,
            emailVerified: authUser?.emailVerified ?? profileData?.emailVerified ?? false,
            role: profileData?.role || 'user',
            bio: profileData?.bio || null,
            createdAt: profileData?.createdAt
                ? typeof profileData.createdAt === 'object' && 'seconds' in profileData.createdAt
                    ? new Date((profileData.createdAt as { seconds: number }).seconds * 1000).toISOString()
                    : profileData.createdAt
                : authUser?.metadata?.creationTime || null,
            updatedAt: profileData?.updatedAt
                ? typeof profileData.updatedAt === 'object' && 'seconds' in profileData.updatedAt
                    ? new Date((profileData.updatedAt as { seconds: number }).seconds * 1000).toISOString()
                    : profileData.updatedAt
                : null,
            lastSignInTime: authUser?.metadata?.lastSignInTime || null,
            disabled: authUser?.disabled || false,
            enrollments: { ...(profileData?.enrollments || {}), ...enrollments },
        };

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch user' },
            { status: 500 }
        );
    }
}
