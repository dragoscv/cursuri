import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAdmin } from '@/utils/api/auth';
import { logAdminAction } from '@/utils/auditLog';
import { validateRequestBody } from '@/utils/security/inputValidation';
import { createIntroOffer, detachIntroOffer } from '@/utils/stripe/introOffers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

interface RouteContext {
    params: Promise<{ id: string; priceId: string }>;
}

/**
 * PATCH /api/stripe/products/[id]/prices/[priceId]
 * Toggle a price's active state or update nickname/metadata.
 * (Stripe doesn't allow changing unit_amount/currency/recurring on an existing
 * price — create a new one instead.)
 */
const PriceUpdateSchema = z.object({
    active: z.boolean().optional(),
    nickname: z.string().max(100).nullable().optional(),
    metadata: z.record(z.string()).optional(),
    /** Mark/unmark this price as the storefront default for its (product, interval). */
    setDefault: z.boolean().optional(),
    /**
     * Intro offer management:
     *   - { unit_amount, months } → set / replace the intro offer
     *   - null                    → remove the existing intro offer
     *   - undefined               → leave intro offer untouched
     */
    intro: z
        .union([
            z.object({
                unit_amount: z.number().int().nonnegative().max(99_999_999),
                months: z.number().int().min(1).max(12),
            }),
            z.null(),
        ])
        .optional(),
});

export async function PATCH(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const { id, priceId } = await ctx.params;

    const validation = await validateRequestBody(request, PriceUpdateSchema);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: validation.errors },
            { status: 400 }
        );
    }

    const data = validation.data!;

    try {
        // Need current price to know its interval for default-uniqueness logic
        // and to merge metadata sensibly.
        const current = await stripe.prices.retrieve(priceId);

        const mergedMeta: Record<string, string> | undefined =
            data.metadata !== undefined || data.setDefault !== undefined
                ? { ...(current.metadata || {}), ...(data.metadata || {}) }
                : undefined;
        if (mergedMeta && data.setDefault !== undefined) {
            mergedMeta.default = String(data.setDefault);
        }

        const updateParams: Stripe.PriceUpdateParams = {};
        if (data.active !== undefined) updateParams.active = data.active;
        if (data.nickname !== undefined) updateParams.nickname = data.nickname ?? '';
        if (mergedMeta !== undefined) updateParams.metadata = mergedMeta;

        const price = await stripe.prices.update(priceId, updateParams);

        // Enforce a single default price per (product, interval)
        if (data.setDefault === true) {
            const intervalForDefault =
                current.type === 'recurring'
                    ? current.recurring?.interval || 'month'
                    : 'one_time';
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

        // Intro offer create/replace/remove
        let finalPrice: Stripe.Price = price;
        if (data.intro !== undefined) {
            // Always detach any existing offer first (idempotent if none)
            await detachIntroOffer(stripe, current.metadata);

            if (data.intro === null) {
                // Clear metadata fields
                const cleaned = { ...(price.metadata || {}) };
                delete cleaned.intro_amount;
                delete cleaned.intro_months;
                delete cleaned.intro_coupon;
                delete cleaned.intro_promotion_code;
                finalPrice = await stripe.prices.update(price.id, {
                    metadata: cleaned,
                });
            } else {
                if (current.type !== 'recurring') {
                    return NextResponse.json(
                        { error: 'Intro offers are only supported on recurring prices.' },
                        { status: 400 }
                    );
                }
                const offer = await createIntroOffer(stripe, price, data.intro);
                finalPrice = await stripe.prices.update(price.id, {
                    metadata: {
                        ...(price.metadata || {}),
                        intro_amount: String(data.intro.unit_amount),
                        intro_months: String(data.intro.months),
                        intro_coupon: offer.couponId,
                        intro_promotion_code: offer.promotionCodeId,
                    },
                });
            }
        }

        await logAdminAction(
            'stripe_price_updated',
            request,
            user,
            'stripe_price',
            priceId,
            {
                fields: Object.keys(updateParams),
                introChanged: data.intro !== undefined,
            },
            true
        );

        return NextResponse.json({ success: true, price: finalPrice });
    } catch (error: any) {
        console.error('Failed to update price:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update price' },
            { status: 500 }
        );
    }
}
