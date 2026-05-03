import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import {
  createGitHubAccount,
  repairAccount,
  setAzureAccountEnabled,
} from '@/utils/github-accounts';

// SCIM provisioning + org membership polling can take up to ~55s for the
// follow-up repair pass, on top of ~10s for the initial create. Give the
// webhook handler a generous budget so the whole flow lands in one execution.
export const maxDuration = 90;

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

/**
 * POST /api/stripe/github-webhook
 * Handles Stripe subscription events:
 * - New subscription → auto-create GitHub account
 * - Subscription canceled/expired → disable account
 * - Subscription renewed → enable account
 */
export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_GITHUB_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error('Stripe credentials not configured for GitHub webhook');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  initFirebaseAdmin();
  const db = getFirestore();

  const relevantEvents = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.paused',
    'customer.subscription.resumed',
  ];

  if (!relevantEvents.includes(event.type)) {
    return NextResponse.json({ received: true });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  const isActive = ['active', 'trialing'].includes(subscription.status);

  try {
    // Handle NEW subscription → auto-create GitHub account
    if (event.type === 'customer.subscription.created' && isActive) {
      // Find the Firebase user by Stripe customer ID
      // Firewand stores customers at /customers/{uid} with stripeId
      const customersSnapshot = await db
        .collection('customers')
        .where('stripeId', '==', customerId)
        .limit(1)
        .get();

      let userId: string | null = null;
      let userEmail: string | null = null;
      let displayName: string | null = null;

      if (!customersSnapshot.empty) {
        userId = customersSnapshot.docs[0].id;
      } else {
        // Fallback: check if the customer doc ID matches the uid directly
        // Firewand sometimes uses uid as the document ID
        const customerDoc = await db.collection('customers').doc(customerId).get();
        if (customerDoc.exists) {
          userId = customerId;
        }
      }

      if (!userId) {
        // Try to find by iterating customers (Firewand stores uid as doc id)
        // The customer in Stripe has email we can match
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
          const usersSnapshot = await db
            .collection('users')
            .where('email', '==', stripeCustomer.email)
            .limit(1)
            .get();
          if (!usersSnapshot.empty) {
            userId = usersSnapshot.docs[0].id;
            userEmail = stripeCustomer.email;
            displayName = usersSnapshot.docs[0].data().displayName || null;
          }
        }
      }

      if (userId) {
        // Get user data if we don't have it yet
        if (!userEmail) {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            userEmail = userData.email;
            displayName = userData.displayName || null;
          }
        }

        if (userEmail) {
          // Check if this user already has an account linked to this subscription
          const existingAccounts = await db
            .collection('users')
            .doc(userId)
            .collection('githubAccounts')
            .where('subscriptionId', '==', subscriptionId)
            .limit(1)
            .get();

          if (existingAccounts.empty) {
            // Auto-create a new GitHub account
            const result = await createGitHubAccount({
              userId,
              userEmail,
              displayName: displayName || undefined,
              createdBy: 'system-webhook',
              subscriptionId,
            });

            if (result.success) {
              console.log(
                `Auto-created GitHub account ${result.account?.githubUsername} for user ${userId} (subscription ${subscriptionId})`
              );

              // The initial create only waits ~4s for SCIM to propagate before
              // adding the user to the org. In practice that's often not
              // enough and org membership ends up `pending`, leaving the
              // admin to click "Repair" manually. Run repairAccount inline
              // here so steps 3 (SCIM provision-on-demand) and 4 (org
              // membership) get the same poll-up-to-~50s treatment as the
              // manual repair button, all within the same webhook execution.
              let repairOutcome: Awaited<ReturnType<typeof repairAccount>> | null = null;
              if (
                result.account &&
                result.account.orgMembershipStatus !== 'added'
              ) {
                try {
                  repairOutcome = await repairAccount({
                    userId,
                    accountId: result.account.id,
                  });
                  console.log(
                    `Auto-repair after create for ${result.account.githubUsername}: orgMembership=${
                      repairOutcome.health?.checks.find((c) => c.id === 'org-membership')
                        ?.status ?? 'unknown'
                    }`
                  );
                } catch (repairErr) {
                  console.error(
                    `Auto-repair after create failed for ${userId}/${result.account.id}:`,
                    repairErr
                  );
                }
              }

              return NextResponse.json({
                received: true,
                action: 'account_created',
                githubUsername: result.account?.githubUsername,
                autoRepair: repairOutcome
                  ? {
                      ranSteps: repairOutcome.steps?.map((s) => ({
                        id: s.id,
                        status: s.status,
                      })),
                      health: repairOutcome.health?.overall,
                    }
                  : null,
              });
            } else {
              console.error(`Failed to auto-create account for ${userId}:`, result.error);
            }
          } else {
            console.log(`Account already exists for subscription ${subscriptionId}`);
          }
        }
      } else {
        console.log(`Could not find Firebase user for Stripe customer ${customerId}`);
      }

      return NextResponse.json({ received: true, action: 'subscription_created' });
    }

    // Handle subscription status changes → enable/disable linked accounts
    const accountsSnapshot = await db
      .collectionGroup('githubAccounts')
      .where('subscriptionId', '==', subscriptionId)
      .get();

    if (accountsSnapshot.empty) {
      console.log(`No GitHub accounts linked to subscription ${subscriptionId}`);
      return NextResponse.json({ received: true, accountsUpdated: 0 });
    }

    let updated = 0;
    for (const doc of accountsSnapshot.docs) {
      const account = doc.data();
      const success = await setAzureAccountEnabled(account.azureUserId, isActive);

      if (success) {
        await doc.ref.update({ isActive, updatedAt: new Date() });
        updated++;
        console.log(
          `${isActive ? 'Enabled' : 'Disabled'} GitHub account ${account.userPrincipalName} for subscription ${subscriptionId}`
        );
      }
    }

    return NextResponse.json({ received: true, accountsUpdated: updated });
  } catch (error) {
    console.error('Error processing subscription webhook for GitHub accounts:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
