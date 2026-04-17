import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAdmin } from '@/utils/api/auth';
import { logAdminAction } from '@/utils/auditLog';
import { validateRequestBody } from '@/utils/security/inputValidation';

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
});

export async function PATCH(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const { priceId } = await ctx.params;

    const validation = await validateRequestBody(request, PriceUpdateSchema);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: validation.errors },
            { status: 400 }
        );
    }

    const data = validation.data!;

    try {
        const updateParams: Stripe.PriceUpdateParams = {};
        if (data.active !== undefined) updateParams.active = data.active;
        if (data.nickname !== undefined) updateParams.nickname = data.nickname ?? '';
        if (data.metadata !== undefined) updateParams.metadata = data.metadata;

        const price = await stripe.prices.update(priceId, updateParams);

        await logAdminAction(
            'stripe_price_updated',
            request,
            user,
            'stripe_price',
            priceId,
            { fields: Object.keys(updateParams) },
            true
        );

        return NextResponse.json({ success: true, price });
    } catch (error: any) {
        console.error('Failed to update price:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update price' },
            { status: 500 }
        );
    }
}
