import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { getAuditLogStatistics } from '@/utils/auditLog';

/**
 * Get Audit Log Statistics - ADMIN ONLY
 *
 * Get aggregated statistics about audit logs
 *
 * Security:
 * - Requires admin authentication
 * - Rate limited (handled by existing middleware)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '24h';

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

    // Get statistics
    const statistics = await getAuditLogStatistics(startDate.toISOString(), now.toISOString());

    return NextResponse.json({
      success: true,
      ...statistics,
      timeRange,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching audit log statistics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
