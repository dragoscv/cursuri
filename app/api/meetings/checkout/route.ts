/**
 * POST /api/meetings/checkout
 * Creates a pending meeting + Stripe Checkout session for a 1-on-1 booking.
 *
 * Pricing model: dynamic price_data per booking (hourlyRate * duration).
 * The product is the admin-managed Stripe product (synced via /api/admin/meetings/config).
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAuth, checkRateLimit } from '@/utils/api/auth';
import {
  createMeetingDoc,
  fetchBusyMeetings,
  getMeetingsConfig,
  updateMeeting,
  userHasActiveSubscription,
} from '@/utils/meetings/firestore';
import { computeMeetingPrice } from '@/utils/meetings/config';
import { hasConflict, validateBookingRequest } from '@/utils/meetings/availability';
import type { Meeting } from '@/types/meetings';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  startAt: z.number().int().positive(),
  durationMinutes: z.number().int().positive().max(480),
  topic: z.string().min(3).max(500),
  notes: z.string().max(2000).optional(),
  timezone: z.string().min(1).max(80),
});

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  if (!stripeSecret) {
    return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 });
  }

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult.user!;

  const allowed = await checkRateLimit(`meetings-checkout:${user.uid}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
  }
  const { startAt, durationMinutes, topic, notes, timezone } = parsed.data;

  try {
    const config = await getMeetingsConfig();

    // Validate against config rules
    const validationError = validateBookingRequest(config, startAt, durationMinutes);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    // Subscription gate
    if (config.requiresActiveSubscription) {
      const isSubscribed = await userHasActiveSubscription(user.uid);
      if (!isSubscribed) {
        return NextResponse.json({ success: false, error: 'subscription_required' }, { status: 403 });
      }
    }

    const endAt = startAt + durationMinutes * 60_000;

    // Conflict check (load a window around the proposed slot)
    const lookFrom = startAt - 24 * 3_600_000;
    const lookTo = endAt + 24 * 3_600_000;
    const busy = await fetchBusyMeetings(lookFrom, lookTo);
    if (hasConflict(startAt, endAt, config.bufferMinutes, busy)) {
      return NextResponse.json({ success: false, error: 'slot_taken' }, { status: 409 });
    }

    const totalAmount = computeMeetingPrice(config.hourlyRateAmount, durationMinutes);

    // Create pending meeting first so the slot is reserved during checkout
    const now = Date.now();
    const meetingDoc: Omit<Meeting, 'id'> = {
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      startAt,
      endAt,
      durationMinutes,
      timezone,
      topic: topic.trim(),
      notes: notes?.trim(),
      status: 'pending_payment',
      hourlyRateAmount: config.hourlyRateAmount,
      currency: config.currency,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    };
    const meetingId = await createMeetingDoc(meetingDoc);

    // Create Stripe Checkout
    const stripe = new Stripe(stripeSecret);
    const successUrl = `${appUrl}/profile/meetings?status=success&meeting=${meetingId}`;
    const cancelUrl = `${appUrl}/book-a-call?status=cancelled&meeting=${meetingId}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        meetingId,
        userId: user.uid,
        type: 'meeting',
      },
      payment_intent_data: {
        metadata: {
          meetingId,
          userId: user.uid,
          type: 'meeting',
        },
      },
      // Stripe checkout session expiration must be between 30 min and 24h
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: config.currency,
            unit_amount: totalAmount,
            product_data: {
              name: `1-on-1 Mentor Call (${durationMinutes} min)`,
              description: topic.slice(0, 200),
              metadata: { meetingId, type: 'meeting' },
            },
          },
        },
      ],
    });

    await updateMeeting(meetingId, { stripeCheckoutSessionId: session.id });

    return NextResponse.json({
      success: true,
      meetingId,
      checkoutUrl: session.url,
    });
  } catch (err: any) {
    console.error('POST /api/meetings/checkout failed:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'checkout_failed' },
      { status: 500 }
    );
  }
}
