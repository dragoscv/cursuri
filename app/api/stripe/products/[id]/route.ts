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
 * GET /api/stripe/products/[id] — fetch one product with prices.
 */
export async function GET(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await ctx.params;

    try {
        const product = await stripe.products.retrieve(id);
        const prices = await stripe.prices.list({ product: id, limit: 100 });
        return NextResponse.json({
            success: true,
            product,
            prices: prices.data,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Product not found' },
            { status: 404 }
        );
    }
}

/**
 * PATCH /api/stripe/products/[id] — update product fields & metadata.
 *
 * Supports special metadata flags: `featured` ("true"/"false") and
 * `mainPlan` ("true"/"false") used by the storefront to highlight a plan.
 */
const ProductUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).nullable().optional(),
    active: z.boolean().optional(),
    images: z.array(z.string().url()).max(8).optional(),
    metadata: z.record(z.string()).optional(),
    /** Convenience flags merged into metadata */
    featured: z.boolean().optional(),
    mainPlan: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const allowed = await checkRateLimit(`stripe-products-update:${user.uid}`, 30, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await ctx.params;

    const validation = await validateRequestBody(request, ProductUpdateSchema);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: validation.errors },
            { status: 400 }
        );
    }

    const data = validation.data!;

    try {
        // If mainPlan=true, clear it on every other product first (only one main plan).
        if (data.mainPlan === true) {
            const list = await stripe.products.list({ limit: 100, active: true });
            await Promise.all(
                list.data
                    .filter((p) => p.id !== id && p.metadata?.mainPlan === 'true')
                    .map((p) =>
                        stripe.products.update(p.id, {
                            metadata: { ...p.metadata, mainPlan: 'false' },
                        })
                    )
            );
        }

        const updateParams: Stripe.ProductUpdateParams = {};
        if (data.name !== undefined) updateParams.name = data.name;
        if (data.description !== undefined) updateParams.description = data.description ?? '';
        if (data.active !== undefined) updateParams.active = data.active;
        if (data.images !== undefined) updateParams.images = data.images;

        // Merge metadata
        if (
            data.metadata !== undefined ||
            data.featured !== undefined ||
            data.mainPlan !== undefined
        ) {
            const current = await stripe.products.retrieve(id);
            const mergedMeta: Record<string, string> = {
                ...(current.metadata || {}),
                ...(data.metadata || {}),
                app: data.metadata?.app || current.metadata?.app || APP_NAME,
            };
            if (data.featured !== undefined) mergedMeta.featured = String(data.featured);
            if (data.mainPlan !== undefined) mergedMeta.mainPlan = String(data.mainPlan);
            updateParams.metadata = mergedMeta;
        }

        const product = await stripe.products.update(id, updateParams);

        await logAdminAction(
            'stripe_product_updated',
            request,
            user,
            'stripe_product',
            product.id,
            { fields: Object.keys(updateParams) },
            true
        );

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Failed to update product:', error);
        await logAdminAction(
            'stripe_product_update_failed',
            request,
            user,
            'stripe_product',
            id,
            { error: error.message },
            false
        );
        return NextResponse.json(
            { error: error.message || 'Failed to update product' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/stripe/products/[id] — archives the product (Stripe doesn't allow
 * hard delete of products with prices). All associated prices are deactivated.
 */
export async function DELETE(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const { id } = await ctx.params;

    try {
        // Deactivate all prices first
        const prices = await stripe.prices.list({ product: id, limit: 100 });
        await Promise.all(
            prices.data
                .filter((p) => p.active)
                .map((p) => stripe.prices.update(p.id, { active: false }))
        );
        // Archive the product
        const product = await stripe.products.update(id, { active: false });

        await logAdminAction(
            'stripe_product_archived',
            request,
            user,
            'stripe_product',
            id,
            { archivedPrices: prices.data.length },
            true
        );

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Failed to archive product:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to archive product' },
            { status: 500 }
        );
    }
}
