import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAdmin, checkRateLimit } from '@/utils/api/auth';
import { logAdminAction } from '@/utils/auditLog';
import { validateRequestBody } from '@/utils/security/inputValidation';

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
            metadata: { ...(data.metadata || {}), app: APP_NAME },
        });

        await logAdminAction(
            'stripe_price_created',
            request,
            user,
            'stripe_price',
            price.id,
            { productId: id, amount: price.unit_amount, currency: price.currency },
            true
        );

        return NextResponse.json({ success: true, price });
    } catch (error: any) {
        console.error('Failed to create price:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create price' },
            { status: 500 }
        );
    }
}
