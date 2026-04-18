/**
 * Admin: PATCH /api/admin/meetings/[id]
 * Update meet link, status, admin notes, or cancel a meeting.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/utils/api/auth';
import { getMeeting, updateMeeting } from '@/utils/meetings/firestore';
import type { Meeting, MeetingStatus } from '@/types/meetings';

export const dynamic = 'force-dynamic';

const PatchSchema = z.object({
  meetLink: z.string().url().max(500).optional().or(z.literal('').transform(() => undefined)),
  status: z.enum(['pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  adminNotes: z.string().max(2000).optional(),
  cancelReason: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid body', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const existing = await getMeeting(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const patch: Partial<Meeting> = {};
    if (parsed.data.meetLink !== undefined) {
      patch.meetLink = parsed.data.meetLink;
      patch.meetLinkAddedAt = Date.now();
    }
    if (parsed.data.adminNotes !== undefined) patch.adminNotes = parsed.data.adminNotes;
    if (parsed.data.status) {
      patch.status = parsed.data.status as MeetingStatus;
      if (parsed.data.status === 'cancelled') {
        patch.cancelledAt = Date.now();
        if (parsed.data.cancelReason) patch.cancelReason = parsed.data.cancelReason;
      }
    }

    await updateMeeting(id, patch);
    const updated = await getMeeting(id);
    return NextResponse.json({ success: true, meeting: updated });
  } catch (err: any) {
    console.error('PATCH /api/admin/meetings/[id] failed:', err);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
