import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { listAvailableAzureUsers } from '@/utils/github-accounts';

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
 * GET /api/admin/github-accounts/available
 * Returns all Azure AD users on the studiai.ro domain with linkage status.
 * Admin only.
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    initFirebaseAdmin();
    const result = await listAvailableAzureUsers();

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, users: result.users });
}
