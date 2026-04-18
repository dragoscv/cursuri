/**
 * Admin: GET / PUT /api/admin/meetings/config
 * Manages the global meetings configuration. PUT also syncs/creates a Stripe product
 * representing 1-on-1 meetings (purely a label; checkout uses dynamic price_data).
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAdmin, checkRateLimit } from '@/utils/api/auth';
import { getMeetingsConfig, setMeetingsConfig } from '@/utils/meetings/firestore';
import type { MeetingsConfig } from '@/types/meetings';

export const dynamic = 'force-dynamic';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'cursuri';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const config = await getMeetingsConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    console.error('GET /api/admin/meetings/config failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to load config' }, { status: 500 });
  }
}

const WeekdayWindowSchema = z.object({
  enabled: z.boolean(),
  startMinutes: z.number().int().min(0).max(24 * 60),
  endMinutes: z.number().int().min(0).max(24 * 60),
});

const ConfigSchema = z.object({
  enabled: z.boolean(),
  hourlyRateAmount: z.number().int().min(0).max(99_999_999),
  currency: z.string().length(3).toLowerCase(),
  minLeadTimeHours: z.number().int().min(0).max(24 * 365),
  maxLeadTimeHours: z.number().int().min(1).max(24 * 365),
  minDurationMinutes: z.number().int().min(5).max(480),
  maxDurationMinutes: z.number().int().min(5).max(480),
  durationStepMinutes: z.number().int().min(5).max(120),
  bufferMinutes: z.number().int().min(0).max(240),
  weeklyAvailability: z.record(z.string(), WeekdayWindowSchema),
  blackoutDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(365),
  timezone: z.string().min(1).max(80),
  requiresActiveSubscription: z.boolean(),
  publicNote: z.string().max(500).optional(),
});

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult.user!;

  const allowed = await checkRateLimit(`meetings-config-put:${user.uid}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = ConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid config', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const incoming = parsed.data;

  // Sanity checks
  if (incoming.minDurationMinutes > incoming.maxDurationMinutes) {
    return NextResponse.json({ success: false, error: 'min duration > max duration' }, { status: 400 });
  }
  if (incoming.minLeadTimeHours > incoming.maxLeadTimeHours) {
    return NextResponse.json({ success: false, error: 'min lead > max lead' }, { status: 400 });
  }
  for (const [key, window] of Object.entries(incoming.weeklyAvailability)) {
    if (window.enabled && window.endMinutes <= window.startMinutes) {
      return NextResponse.json({ success: false, error: `invalid window for day ${key}` }, { status: 400 });
    }
  }

  // Optionally sync a marker Stripe product so the admin sees something in their dashboard.
  let stripeProductId = (await getMeetingsConfig()).stripeProductId;
  let stripePriceId = (await getMeetingsConfig()).stripePriceId;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (stripeSecret) {
    try {
      const stripe = new Stripe(stripeSecret);
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: '1-on-1 Mentor Call',
          description: 'Paid 1-on-1 mentorship video call. Charged by the hour at checkout.',
          metadata: { app: APP_NAME, type: 'meeting' },
        });
        stripeProductId = product.id;
      }
      // Create a reference per-hour price (informational; checkout uses price_data).
      const referencePrice = await stripe.prices.create({
        product: stripeProductId!,
        unit_amount: incoming.hourlyRateAmount,
        currency: incoming.currency,
        nickname: 'Per hour (reference)',
        metadata: { app: APP_NAME, type: 'meeting', reference: 'true' },
      });
      stripePriceId = referencePrice.id;
    } catch (stripeErr: any) {
      console.warn('Stripe sync skipped:', stripeErr?.message);
    }
  }

  try {
    const merged = await setMeetingsConfig(
      {
        ...(incoming as Partial<MeetingsConfig>),
        stripeProductId,
        stripePriceId,
      },
      user.uid
    );
    return NextResponse.json({ success: true, config: merged });
  } catch (err: any) {
    console.error('PUT /api/admin/meetings/config failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to save config' }, { status: 500 });
  }
}
