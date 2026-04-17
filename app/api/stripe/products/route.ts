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

/**
 * GET /api/stripe/products
 * List all Stripe products with their prices, filtered by `app` metadata.
 * Query params:
 *  - active=true|false|all (default: all)
 *  - type=subscription|one_time|all (default: all)
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const allowed = await checkRateLimit(`stripe-products-list:${user.uid}`, 60, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const url = new URL(request.url);
    const activeParam = url.searchParams.get('active') ?? 'all';
    const typeParam = url.searchParams.get('type') ?? 'all';

    try {
        // Fetch all products (paginated up to 200, sufficient for SaaS plan catalogs)
        const products: Stripe.Product[] = [];
        let starting_after: string | undefined;
        for (let page = 0; page < 4; page++) {
            const resp: Stripe.ApiList<Stripe.Product> = await stripe.products.list({
                limit: 100,
                active: activeParam === 'all' ? undefined : activeParam === 'true',
                starting_after,
            });
            products.push(...resp.data);
            if (!resp.has_more) break;
            starting_after = resp.data[resp.data.length - 1]?.id;
        }

        // Filter by app metadata (only show products belonging to this app)
        const appProducts = products.filter(
            (p) => !p.metadata?.app || p.metadata.app === APP_NAME
        );

        // Fetch prices for each product
        const productsWithPrices = await Promise.all(
            appProducts.map(async (product) => {
                const prices = await stripe.prices.list({
                    product: product.id,
                    limit: 100,
                });
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    active: product.active,
                    metadata: product.metadata,
                    images: product.images,
                    created: product.created,
                    updated: product.updated,
                    prices: prices.data.map((pr) => ({
                        id: pr.id,
                        active: pr.active,
                        currency: pr.currency,
                        unit_amount: pr.unit_amount,
                        type: pr.type, // 'recurring' | 'one_time'
                        recurring: pr.recurring
                            ? {
                                interval: pr.recurring.interval,
                                interval_count: pr.recurring.interval_count,
                                trial_period_days: pr.recurring.trial_period_days,
                            }
                            : null,
                        nickname: pr.nickname,
                        metadata: pr.metadata,
                        created: pr.created,
                    })),
                };
            })
        );

        // Filter by type (after price fetch since type is a price attribute)
        const filtered =
            typeParam === 'all'
                ? productsWithPrices
                : productsWithPrices.filter((p) => {
                    const hasRecurring = p.prices.some((pr) => pr.type === 'recurring');
                    const hasOneTime = p.prices.some((pr) => pr.type === 'one_time');
                    if (typeParam === 'subscription') return hasRecurring;
                    if (typeParam === 'one_time') return hasOneTime && !hasRecurring;
                    return true;
                });

        return NextResponse.json({ success: true, products: filtered });
    } catch (error: any) {
        console.error('Failed to list Stripe products:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to list products' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/stripe/products
 * Create a new product, optionally with an initial price.
 */
const ProductCreateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    active: z.boolean().optional().default(true),
    images: z.array(z.string().url()).max(8).optional(),
    metadata: z.record(z.string()).optional(),
    initialPrice: z
        .object({
            unit_amount: z.number().int().nonnegative().max(99_999_999),
            currency: z.string().length(3),
            type: z.enum(['recurring', 'one_time']).default('recurring'),
            interval: z.enum(['day', 'week', 'month', 'year']).optional(),
            interval_count: z.number().int().min(1).max(12).optional(),
            trial_period_days: z.number().int().min(0).max(365).optional(),
            nickname: z.string().max(100).optional(),
        })
        .optional(),
});

export async function POST(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const allowed = await checkRateLimit(`stripe-products-create:${user.uid}`, 20, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const validation = await validateRequestBody(request, ProductCreateSchema);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: validation.errors },
            { status: 400 }
        );
    }

    const data = validation.data!;

    try {
        const product = await stripe.products.create({
            name: data.name,
            description: data.description,
            active: data.active ?? true,
            images: data.images,
            metadata: {
                ...(data.metadata || {}),
                app: data.metadata?.app || APP_NAME,
            },
        });

        let price: Stripe.Price | null = null;
        if (data.initialPrice) {
            const ip = data.initialPrice;
            price = await stripe.prices.create({
                product: product.id,
                unit_amount: ip.unit_amount,
                currency: ip.currency.toLowerCase(),
                nickname: ip.nickname,
                recurring:
                    ip.type === 'recurring'
                        ? {
                            interval: ip.interval || 'month',
                            interval_count: ip.interval_count || 1,
                            trial_period_days: ip.trial_period_days,
                        }
                        : undefined,
                metadata: { app: APP_NAME },
            });
        }

        await logAdminAction(
            'stripe_product_created',
            request,
            user,
            'stripe_product',
            product.id,
            { name: product.name, initialPriceId: price?.id },
            true
        );

        return NextResponse.json({ success: true, product, price });
    } catch (error: any) {
        console.error('Failed to create Stripe product:', error);
        await logAdminAction(
            'stripe_product_creation_failed',
            request,
            user,
            'stripe_product',
            undefined,
            { error: error.message },
            false
        );
        return NextResponse.json(
            { error: error.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}
