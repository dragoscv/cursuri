import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { z } from 'zod';
import { checkAccountHealth, repairAccount } from '@/utils/github-accounts';

const Schema = z.object({
  userId: z.string().min(1),
  accountId: z.string().min(1),
});

/**
 * POST /api/admin/github-accounts/health
 * Body: { userId, accountId }
 * Runs the health check and returns the per-step status.
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
    const result = await checkAccountHealth(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running health check:', error);
    return NextResponse.json(
      {
        error: 'Failed to run health check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
