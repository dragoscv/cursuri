/**
 * GET /api/meetings/mine
 * Returns the authenticated user's meetings.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/utils/api/auth';
import { listUserMeetings } from '@/utils/meetings/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult.user!;
  try {
    const meetings = await listUserMeetings(user.uid);
    return NextResponse.json({ success: true, meetings });
  } catch (err: any) {
    console.error('GET /api/meetings/mine failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to load meetings' }, { status: 500 });
  }
}
