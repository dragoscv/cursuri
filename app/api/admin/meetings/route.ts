/**
 * Admin: GET /api/admin/meetings — list all meetings.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { listAllMeetings } from '@/utils/meetings/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'all';
  const limit = Math.min(Number(url.searchParams.get('limit') || '200'), 500);
  try {
    const meetings = await listAllMeetings({ status, limit });
    return NextResponse.json({ success: true, meetings });
  } catch (err: any) {
    console.error('GET /api/admin/meetings failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to load meetings' }, { status: 500 });
  }
}
