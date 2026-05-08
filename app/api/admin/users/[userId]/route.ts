import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { z } from 'zod';
import { requireAdmin } from '@/utils/api/auth';
import { logUserManagementAction } from '@/utils/auditLog';

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

const PatchSchema = z.object({
    displayName: z.string().max(200).optional(),
    role: z.enum(['user', 'instructor', 'admin', 'super_admin']).optional(),
    bio: z.string().max(2000).optional().nullable(),
    disabled: z.boolean().optional(),
});

/**
 * PATCH /api/admin/users/[userId]
 * Update an admin-managed user profile. Audit-logs every mutation.
 * Role changes are flagged as critical for the audit trail.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const adminUser = authResult.user!;

    const { userId } = await params;
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        initFirebaseAdmin();
        const db = getFirestore();
        const auth = getAuth();
        const userRef = db.collection('users').doc(userId);

        const beforeDoc = await userRef.get();
        const beforeData = beforeDoc.exists ? beforeDoc.data() || {} : {};

        const updates: Record<string, unknown> = {
            ...parsed.data,
            updatedAt: new Date().toISOString(),
        };
        // Strip undefined keys so we don't overwrite with null.
        Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

        await userRef.set(updates, { merge: true });

        // Mirror disabled flag to Firebase Auth if changed.
        if (typeof parsed.data.disabled === 'boolean') {
            try {
                await auth.updateUser(userId, { disabled: parsed.data.disabled });
            } catch (err) {
                console.error('Failed to mirror disabled flag to Firebase Auth:', err);
            }
        }

        // Audit log — flag role changes specially so the admin trail is searchable.
        const changedKeys = Object.keys(parsed.data);
        const roleChanged = parsed.data.role && parsed.data.role !== beforeData.role;
        const disabledChanged =
            typeof parsed.data.disabled === 'boolean' &&
            parsed.data.disabled !== Boolean(beforeData.disabled);

        await logUserManagementAction(
            roleChanged
                ? 'user_role_changed'
                : disabledChanged
                    ? parsed.data.disabled
                        ? 'user_disabled'
                        : 'user_enabled'
                    : 'user_profile_updated',
            request,
            adminUser,
            userId,
            {
                changedKeys,
                before: changedKeys.reduce<Record<string, unknown>>((acc, k) => {
                    acc[k] = (beforeData as Record<string, unknown>)[k] ?? null;
                    return acc;
                }, {}),
                after: parsed.data,
            },
            true
        );

        const afterDoc = await userRef.get();
        return NextResponse.json({ success: true, user: { id: userId, ...afterDoc.data() } });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update user' },
            { status: 500 }
        );
    }
}
