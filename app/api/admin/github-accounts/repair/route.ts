import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { z } from 'zod';
import { repairAccount } from '@/utils/github-accounts';

// Repair can take up to ~55s (provision wait + 8 poll attempts for SCIM).
// Set explicit max duration so Vercel doesn't kill it on the default 10s/15s.
export const maxDuration = 60;

const Schema = z.object({
  userId: z.string().min(1),
  accountId: z.string().min(1),
});

/**
 * POST /api/admin/github-accounts/repair
 * Body: { userId, accountId }
 * Re-runs any missing/failed provisioning steps (EMU assignment, SCIM
 * provision-on-demand, org membership) and returns a fresh health report.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await repairAccount(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error repairing account:', error);
    return NextResponse.json(
      {
        error: 'Failed to repair account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
