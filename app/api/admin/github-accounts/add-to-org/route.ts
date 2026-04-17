import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { z } from 'zod';
import { retryAddAccountToOrg } from '@/utils/github-accounts';

const Schema = z.object({
  userId: z.string().min(1),
  accountId: z.string().min(1),
});

/**
 * POST /api/admin/github-accounts/add-to-org
 * Retries adding a previously-created GitHub account to the studiai-students
 * organization. Used when the initial attempt was `pending` (SCIM delay) or
 * `failed`. Updates Firestore with the latest status.
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
    const result = await retryAddAccountToOrg(parsed.data);
    return NextResponse.json({
      success: result.status === 'added',
      status: result.status,
      error: result.error,
      githubUsername: result.githubUsername,
    });
  } catch (error) {
    console.error('Error retrying org membership:', error);
    return NextResponse.json(
      {
        error: 'Failed to add user to organization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
