/**
 * GET /api/meetings/availability?from=<unix-ms>&to=<unix-ms>&duration=<minutes>
 * Returns open slots in [from, to] for the given duration, respecting busy meetings.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchBusyMeetings, getMeetingsConfig } from '@/utils/meetings/firestore';
import { computeAvailableSlots } from '@/utils/meetings/availability';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  from: z.coerce.number().int().positive(),
  to: z.coerce.number().int().positive(),
  duration: z.coerce.number().int().positive().max(480),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    duration: url.searchParams.get('duration'),
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
  }
  const { from, to, duration } = parsed.data;
  if (to <= from) {
    return NextResponse.json({ success: false, error: 'Invalid range' }, { status: 400 });
  }
  // Cap range to 31 days to limit work.
  const maxRangeMs = 31 * 24 * 3_600_000;
  if (to - from > maxRangeMs) {
    return NextResponse.json({ success: false, error: 'Range too large' }, { status: 400 });
  }

  try {
    const config = await getMeetingsConfig();
    if (!config.enabled) {
      return NextResponse.json({ success: true, slots: [] });
    }
    const busy = await fetchBusyMeetings(from, to);
    const slots = computeAvailableSlots({
      config,
      durationMinutes: duration,
      fromUtcMs: from,
      toUtcMs: to,
      busyMeetings: busy,
    });
    return NextResponse.json({ success: true, slots });
  } catch (err: any) {
    console.error('GET /api/meetings/availability failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to load availability' }, { status: 500 });
  }
}
