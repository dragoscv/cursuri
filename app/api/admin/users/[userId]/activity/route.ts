/**
 * GET /api/admin/users/[userId]/activity
 *
 * Returns a unified activity timeline for a single user:
 *   - audit_logs filtered by userId (auth, admin, payment, security…)
 *   - users/{uid}/activity entries (lesson/course completion etc.)
 *
 * Both streams are merged and sorted desc by timestamp.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { requireAdmin } from '@/utils/api/auth';
import { queryAuditLogs, AuditCategory, AuditSeverity } from '@/utils/auditLog';

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

interface TimelineEntry {
    id: string;
    timestamp: string;
    source: 'audit' | 'activity';
    type: string;
    category?: string;
    severity?: string;
    success?: boolean;
    actorRole?: string;
    actorId?: string;
    actorEmail?: string;
    ipAddress?: string;
    details?: Record<string, unknown>;
}

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

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || '100'), 500);
    const category = url.searchParams.get('category') as AuditCategory | null;

    try {
        initFirebaseAdmin();
        const db = getFirestore();

        // Audit logs where this user is the actor.
        const actorLogsPromise = queryAuditLogs(
            { userId, ...(category ? { category } : {}) },
            limit
        );
        // Audit logs where this user is the resource (e.g., admin acted on them).
        const resourceLogsPromise = queryAuditLogs(
            { resourceId: userId, ...(category ? { category } : {}) },
            limit
        );

        // User-side activity (lesson/course completion etc.).
        const activityPromise = db
            .collection('users')
            .doc(userId)
            .collection('activity')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get()
            .catch(() => null);

        const [actorLogs, resourceLogs, activitySnap] = await Promise.all([
            actorLogsPromise,
            resourceLogsPromise,
            activityPromise,
        ]);

        const auditMerged = new Map<string, TimelineEntry>();
        for (const log of [...actorLogs, ...resourceLogs]) {
            const id = `${log.timestamp}-${log.action}-${log.resourceId || ''}`;
            if (auditMerged.has(id)) continue;
            auditMerged.set(id, {
                id,
                timestamp: log.timestamp,
                source: 'audit',
                type: log.action,
                category: log.category,
                severity: log.severity,
                success: log.success,
                actorRole: log.userRole,
                actorId: log.userId,
                actorEmail: log.userEmail,
                ipAddress: log.ipAddress,
                details: log.details,
            });
        }

        const activityEntries: TimelineEntry[] = [];
        if (activitySnap) {
            activitySnap.forEach((doc) => {
                const data = doc.data();
                const ts = data.timestamp?.toDate
                    ? data.timestamp.toDate().toISOString()
                    : typeof data.timestamp === 'string'
                        ? data.timestamp
                        : new Date().toISOString();
                activityEntries.push({
                    id: doc.id,
                    timestamp: ts,
                    source: 'activity',
                    type: data.type || 'activity',
                    severity: AuditSeverity.INFO,
                    success: true,
                    details: { ...data, timestamp: undefined },
                });
            });
        }

        const all: TimelineEntry[] = [
            ...Array.from(auditMerged.values()),
            ...activityEntries,
        ].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

        return NextResponse.json({
            success: true,
            entries: all.slice(0, limit),
            counts: {
                audit: auditMerged.size,
                activity: activityEntries.length,
                total: all.length,
            },
        });
    } catch (error) {
        console.error('Failed to load user activity:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load activity' },
            { status: 500 }
        );
    }
}
