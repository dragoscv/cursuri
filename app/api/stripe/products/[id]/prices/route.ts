import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAdmin, checkRateLimit } from '@/utils/api/auth';
import { logAdminAction } from '@/utils/auditLog';
import { validateRequestBody } from '@/utils/security/inputValidation';
import { createIntroOffer } from '@/utils/stripe/introOffers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'cursuri';

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/stripe/products/[id]/prices — create a new price for the product.
 * Stripe doesn't allow editing the amount/currency of an existing price; you
 * must create a new one and deactivate the old.
 */
const PriceCreateSchema = z.object({
    unit_amount: z.number().int().nonnegative().max(99_999_999),
    currency: z.string().length(3),
    type: z.enum(['recurring', 'one_time']).default('recurring'),
    interval: z.enum(['day', 'week', 'month', 'year']).optional(),
    interval_count: z.number().int().min(1).max(12).optional(),
    trial_period_days: z.number().int().min(0).max(365).optional(),
    nickname: z.string().max(100).optional(),
    metadata: z.record(z.string()).optional(),
    /** Mark this price as the storefront default for its (product, interval). */
    setDefault: z.boolean().optional(),
    /**
     * Optional intro offer: charge a lower amount for the first N billing
     * periods, then revert to `unit_amount`. Implemented via a Stripe Coupon
     * + hidden Promotion Code applied automatically at checkout.
     */
    intro: z
        .object({
            unit_amount: z.number().int().nonnegative().max(99_999_999),
            months: z.number().int().min(1).max(12),
        })
        .optional(),
});

export async function POST(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const allowed = await checkRateLimit(`stripe-prices-create:${user.uid}`, 30, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await ctx.params;

    const validation = await validateRequestBody(request, PriceCreateSchema);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: validation.errors },
            { status: 400 }
        );
    }

    const data = validation.data!;

    try {
        const intervalForDefault =
            data.type === 'recurring' ? data.interval || 'month' : 'one_time';

        const baseMetadata: Record<string, string> = {
            ...(data.metadata || {}),
            app: APP_NAME,
        };
        if (data.setDefault) baseMetadata.default = 'true';

        const price = await stripe.prices.create({
            product: id,
            unit_amount: data.unit_amount,
            currency: data.currency.toLowerCase(),
            nickname: data.nickname,
            recurring:
                data.type === 'recurring'
                    ? {
                        interval: data.interval || 'month',
                        interval_count: data.interval_count || 1,
                        trial_period_days: data.trial_period_days,
                    }
                    : undefined,
            metadata: baseMetadata,
        });

        // Enforce a single default price per (product, interval)
        if (data.setDefault) {
            const existing = await stripe.prices.list({ product: id, limit: 100 });
            await Promise.all(
                existing.data
                    .filter((p) => {
                        if (p.id === price.id) return false;
                        if (p.metadata?.default !== 'true') return false;
                        const intv =
                            p.type === 'recurring'
                                ? p.recurring?.interval || 'month'
                                : 'one_time';
                        return intv === intervalForDefault;
                    })
                    .map((p) =>
                        stripe.prices.update(p.id, {
                            metadata: { ...p.metadata, default: 'false' },
                        })
                    )
            );
        }

        // Attach intro offer (recurring prices only)
        let finalPrice: Stripe.Price = price;
        if (data.intro && data.type === 'recurring') {
            const offer = await createIntroOffer(stripe, price, data.intro);
            finalPrice = await stripe.prices.update(price.id, {
                metadata: {
                    ...price.metadata,
                    intro_amount: String(data.intro.unit_amount),
                    intro_months: String(data.intro.months),
                    intro_coupon: offer.couponId,
                    intro_promotion_code: offer.promotionCodeId,
                },
            });
        }

        await logAdminAction(
            'stripe_price_created',
            request,
            user,
            'stripe_price',
            finalPrice.id,
            {
                productId: id,
                amount: finalPrice.unit_amount,
                currency: finalPrice.currency,
                hasIntro: !!data.intro,
            },
            true
        );

        return NextResponse.json({ success: true, price: finalPrice });
    } catch (error: any) {
        console.error('Failed to create price:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create price' },
            { status: 500 }
        );
    }
}
