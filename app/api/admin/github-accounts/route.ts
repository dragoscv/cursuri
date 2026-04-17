import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/api/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import {
  createGitHubAccount,
  setAzureAccountEnabled,
} from '@/utils/github-accounts';

const CreateSchema = z.object({
  userId: z.string().min(1),
  userEmail: z.string().email(),
  displayName: z.string().optional(),
  subscriptionId: z.string().optional(),
});

const ToggleSchema = z.object({
  accountId: z.string().min(1),
  userId: z.string().min(1),
  enabled: z.boolean(),
});

const LinkSubscriptionSchema = z.object({
  accountId: z.string().min(1),
  userId: z.string().min(1),
  subscriptionId: z.string().min(1),
});

/**
 * GET /api/admin/github-accounts?userId=xxx
 * List all GitHub accounts for a user
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId query parameter required' }, { status: 400 });
  }

  try {
    const db = getFirestore();
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .orderBy('accountNumber', 'asc')
      .get();

    const accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching GitHub accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

/**
 * POST /api/admin/github-accounts
 * Create a new account, assign to GitHub app, and provision on demand
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const adminUser = authResult.user!;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = CreateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, userEmail, displayName, subscriptionId } = validation.data;

  const result = await createGitHubAccount({
    userId,
    userEmail,
    displayName,
    createdBy: adminUser.uid,
    subscriptionId,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, details: result.details },
      { status: result.error?.includes('already exists') ? 409 : 500 }
    );
  }

  return NextResponse.json({ success: true, account: result.account });
}

/**
 * PATCH /api/admin/github-accounts
 * Toggle account enabled/disabled
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = ToggleSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { accountId, userId, enabled } = validation.data;

  try {
    const db = getFirestore();
    const accountDoc = await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .doc(accountId)
      .get();

    if (!accountDoc.exists) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = accountDoc.data()!;
    const success = await setAzureAccountEnabled(account.azureUserId, enabled);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update account status' }, { status: 500 });
    }

    await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .doc(accountId)
      .update({ isActive: enabled, updatedAt: new Date() });

    return NextResponse.json({ success: true, accountId, isActive: enabled });
  } catch (error) {
    console.error('Error toggling GitHub account:', error);
    return NextResponse.json(
      { error: 'Failed to toggle account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/github-accounts
 * Link a subscription to a GitHub account
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = LinkSubscriptionSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { accountId, userId, subscriptionId } = validation.data;

  try {
    const db = getFirestore();
    const accountRef = db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .doc(accountId);

    const accountDoc = await accountRef.get();
    if (!accountDoc.exists) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    await accountRef.update({
      subscriptionId,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      accountId,
      subscriptionId,
    });
  } catch (error) {
    console.error('Error linking subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to link subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
