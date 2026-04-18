/**
 * POST /api/stripe/meetings-webhook
 * Confirms a meeting booking after successful Stripe Checkout payment.
 *
 * Configure in Stripe Dashboard with a separate webhook endpoint pointed here,
 * subscribed to: checkout.session.completed, checkout.session.expired,
 * checkout.session.async_payment_failed.
 *
 * Uses STRIPE_MEETINGS_WEBHOOK_SECRET (separate signing secret per endpoint).
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getMeeting, updateMeeting } from '@/utils/meetings/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_MEETINGS_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    console.error('Stripe meetings webhook not configured');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Meetings webhook signature verification failed:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const meetingId = session.metadata?.meetingId;
      if (!meetingId || session.metadata?.type !== 'meeting') {
        // Not a meeting checkout, ignore.
        return NextResponse.json({ received: true });
      }

      const meeting = await getMeeting(meetingId);
      if (!meeting) {
        console.warn(`Meeting ${meetingId} not found for completed checkout ${session.id}`);
        return NextResponse.json({ received: true });
      }
      // Idempotency: only confirm if still pending.
      if (meeting.status === 'pending_payment') {
        await updateMeeting(meetingId, {
          status: 'confirmed',
          paidAt: Date.now(),
          stripePaymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
        });
      }
    } else if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const meetingId = session.metadata?.meetingId;
      if (!meetingId || session.metadata?.type !== 'meeting') {
        return NextResponse.json({ received: true });
      }
      const meeting = await getMeeting(meetingId);
      if (meeting && meeting.status === 'pending_payment') {
        await updateMeeting(meetingId, {
          status: 'cancelled',
          cancelledAt: Date.now(),
          cancelReason: event.type,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Meetings webhook handler error:', err);
    return NextResponse.json({ error: 'handler_error' }, { status: 500 });
  }
}
