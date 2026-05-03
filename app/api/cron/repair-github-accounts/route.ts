import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { repairAccount } from '@/utils/github-accounts';

// Each repair pass can take up to ~55s. Keep concurrency low to stay within
// Vercel's per-invocation limit while still reliably draining the queue.
export const maxDuration = 300;

function initFirebaseAdmin() {
  if (!getApps().length) {
    const hasCredentials = !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
    if (hasCredentials) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
}

// Don't re-attempt accounts we just touched. Helps avoid hammering Graph
// when SCIM is genuinely backlogged (Azure quotes up to 40min when on-demand
// is unavailable).
const MIN_RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_PER_RUN = 10;

/**
 * GET /api/cron/repair-github-accounts
 *
 * Sweeps every githubAccounts doc whose org membership is not yet `added`
 * and runs repairAccount on it. This is the safety net for cases where the
 * Stripe webhook auto-repair couldn't finish in one execution (SCIM still
 * backlogged after ~50s of polling).
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` header. Vercel Cron
 * automatically sends this when CRON_SECRET is set as an env var.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured on server' },
      { status: 500 }
    );
  }
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  initFirebaseAdmin();
  const db = getFirestore();

  // Find every account currently flagged as not-added. We intentionally do
  // not filter by isActive — a paused/canceled subscription's account is
  // disabled separately by the Stripe webhook and won't show up here as
  // pending unless it was created in that state.
  const incompleteSnap = await db
    .collectionGroup('githubAccounts')
    .where('orgMembershipStatus', 'in', ['pending', 'failed'])
    .limit(MAX_PER_RUN * 4) // pull a bit extra so the dedupe still leaves enough work
    .get();

  if (incompleteSnap.empty) {
    return NextResponse.json({ checked: 0, repaired: 0, skipped: 0 });
  }

  const now = Date.now();
  let repaired = 0;
  let skipped = 0;
  const results: Array<{
    userId: string;
    accountId: string;
    githubUsername: string;
    before: string;
    after: string | undefined;
    overall: string | undefined;
  }> = [];

  for (const doc of incompleteSnap.docs) {
    if (results.length >= MAX_PER_RUN) break;

    const data = doc.data();
    const lastAttempt = data.orgMembershipLastAttempt as Timestamp | undefined;
    if (lastAttempt && now - lastAttempt.toMillis() < MIN_RETRY_INTERVAL_MS) {
      skipped++;
      continue;
    }

    // Path: users/{userId}/githubAccounts/{accountId}
    const accountId = doc.id;
    const userId = doc.ref.parent.parent?.id;
    if (!userId) continue;

    try {
      const before = data.orgMembershipStatus as string;
      const outcome = await repairAccount({ userId, accountId });
      const after = outcome.steps?.find((s) => s.id === 'org-membership')?.status;
      results.push({
        userId,
        accountId,
        githubUsername: data.githubUsername,
        before,
        after,
        overall: outcome.health?.overall,
      });
      repaired++;
    } catch (err) {
      console.error(
        `Cron repair failed for ${userId}/${accountId}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return NextResponse.json({
    checked: incompleteSnap.size,
    repaired,
    skipped,
    results,
  });
}
