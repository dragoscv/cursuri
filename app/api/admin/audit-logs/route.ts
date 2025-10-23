import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { queryAuditLogs, AuditCategory, AuditSeverity } from '@/utils/auditLog';
import { logAdminAction } from '@/utils/auditLog';

/**
 * Get Audit Logs - ADMIN ONLY
 *
 * Query audit logs with filters
 *
 * Security:
 * - Requires admin authentication
 * - Rate limited (handled by existing middleware)
 * - Logs access to audit logs (meta-logging)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as AuditCategory | null;
    const severity = searchParams.get('severity') as AuditSeverity | null;
    const timeRange = searchParams.get('timeRange') || '24h';
    const userId = searchParams.get('userId') || undefined;
    const resourceId = searchParams.get('resourceId') || undefined;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    // Query audit logs
    const logs = await queryAuditLogs(
      {
        category: category || undefined,
        severity: severity || undefined,
        userId,
        resourceId,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
      500 // Limit to 500 most recent logs
    );

    // Log audit log access (meta-logging)
    await logAdminAction(
      'audit_logs_accessed',
      request,
      user,
      'audit_logs',
      undefined,
      {
        filters: {
          category,
          severity,
          timeRange,
          userId,
          resourceId,
        },
        resultCount: logs.length,
      },
      true
    );

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
      filters: {
        category,
        severity,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
