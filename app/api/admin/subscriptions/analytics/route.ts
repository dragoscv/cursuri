import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdmin, checkRateLimit } from '@/utils/api/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'cursuri';

interface PlanBreakdown {
    productId: string;
    productName: string;
    priceId: string;
    interval: string | null;
    unit_amount: number;
    currency: string;
    activeCount: number;
    monthlyValue: number;
}

interface RecentSub {
    id: string;
    status: string;
    customerEmail: string | null;
    productName: string;
    interval: string | null;
    unit_amount: number;
    currency: string;
    created: number;
    current_period_end: number | null;
    cancel_at_period_end: boolean;
}

/**
 * GET /api/admin/subscriptions/analytics
 *
 * Aggregates Stripe subscription data into MRR, ARR, active counts,
 * status breakdown, plan breakdown, churn (last 30d) and recent subs.
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const allowed = await checkRateLimit(`admin-subs-analytics:${user.uid}`, 30, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        // Page through all subscriptions (any status)
        const all: Stripe.Subscription[] = [];
        let starting_after: string | undefined;
        for (let page = 0; page < 10; page++) {
            const resp: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
                limit: 100,
                status: 'all',
                starting_after,
                expand: ['data.items.data.price', 'data.customer'],
            });
            all.push(...resp.data);
            if (!resp.has_more) break;
            starting_after = resp.data[resp.data.length - 1]?.id;
        }

        // Filter to this app via product metadata.app
        const productCache = new Map<string, Stripe.Product>();
        const getProduct = async (productId: string): Promise<Stripe.Product | null> => {
            if (productCache.has(productId)) return productCache.get(productId)!;
            try {
                const p = await stripe.products.retrieve(productId);
                productCache.set(productId, p);
                return p;
            } catch {
                return null;
            }
        };

        const enriched: Array<{
            sub: Stripe.Subscription;
            firstItem: Stripe.SubscriptionItem | undefined;
            price: Stripe.Price | null;
            product: Stripe.Product | null;
        }> = [];

        for (const sub of all) {
            const firstItem = sub.items.data[0];
            const price =
                firstItem && typeof firstItem.price === 'object' ? firstItem.price : null;
            const productId =
                price?.product && typeof price.product === 'string'
                    ? price.product
                    : (price?.product as Stripe.Product | undefined)?.id ?? null;
            const product = productId ? await getProduct(productId) : null;
            if (product && product.metadata?.app && product.metadata.app !== APP_NAME) continue;
            enriched.push({ sub, firstItem, price, product });
        }

        // KPIs
        let mrrCents = 0;
        let activeCount = 0;
        let trialingCount = 0;
        let pastDueCount = 0;
        let canceledCount = 0;
        let incompleteCount = 0;
        let cancelAtPeriodEndCount = 0;

        const planMap = new Map<string, PlanBreakdown>();
        const signupsByMonth: Record<string, number> = {};
        const cancellationsByMonth: Record<string, number> = {};

        const now = Date.now() / 1000;
        const thirtyDaysAgo = now - 30 * 86_400;

        let canceledLast30 = 0;
        let activeStartOf30dWindow = 0; // approximation: those created before window
        let createdLast30 = 0;

        for (const { sub, price, product } of enriched) {
            const isActive =
                sub.status === 'active' ||
                sub.status === 'trialing' ||
                sub.status === 'past_due';

            if (sub.status === 'active') activeCount++;
            else if (sub.status === 'trialing') trialingCount++;
            else if (sub.status === 'past_due') pastDueCount++;
            else if (sub.status === 'canceled') canceledCount++;
            else if (
                sub.status === 'incomplete' ||
                sub.status === 'incomplete_expired'
            )
                incompleteCount++;

            if (sub.cancel_at_period_end) cancelAtPeriodEndCount++;

            // MRR contribution from active/trialing
            if (
                (sub.status === 'active' || sub.status === 'trialing') &&
                price?.unit_amount &&
                price.recurring
            ) {
                const amt = price.unit_amount;
                const intervalMonths =
                    price.recurring.interval === 'year'
                        ? 12
                        : price.recurring.interval === 'week'
                            ? 0.25
                            : price.recurring.interval === 'day'
                                ? 1 / 30
                                : 1;
                const count = price.recurring.interval_count || 1;
                mrrCents += amt / (intervalMonths * count);

                const key = price.id;
                const existing = planMap.get(key);
                if (existing) {
                    existing.activeCount++;
                    existing.monthlyValue += amt / (intervalMonths * count) / 100;
                } else {
                    planMap.set(key, {
                        productId: product?.id || '',
                        productName: product?.name || 'Unknown',
                        priceId: price.id,
                        interval: price.recurring.interval,
                        unit_amount: amt,
                        currency: price.currency,
                        activeCount: 1,
                        monthlyValue: amt / (intervalMonths * count) / 100,
                    });
                }
            }

            // Cohorts
            const created = sub.created;
            if (created > 0) {
                const d = new Date(created * 1000);
                const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
                signupsByMonth[key] = (signupsByMonth[key] || 0) + 1;
                if (created < thirtyDaysAgo && isActive) activeStartOf30dWindow++;
                if (created >= thirtyDaysAgo) createdLast30++;
            }

            const canceledAt = sub.canceled_at || sub.ended_at || 0;
            if (canceledAt) {
                const d = new Date(canceledAt * 1000);
                const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
                cancellationsByMonth[key] = (cancellationsByMonth[key] || 0) + 1;
                if (canceledAt >= thirtyDaysAgo) canceledLast30++;
            }
        }

        const mrr = mrrCents / 100;
        const arr = mrr * 12;
        const churnRate30d =
            activeStartOf30dWindow > 0 ? (canceledLast30 / activeStartOf30dWindow) * 100 : 0;

        // Recent 10 subs (sorted by created desc)
        const recent: RecentSub[] = enriched
            .slice()
            .sort((a, b) => b.sub.created - a.sub.created)
            .slice(0, 10)
            .map(({ sub, price, product }) => {
                const customer = sub.customer as Stripe.Customer | string;
                const customerEmail =
                    typeof customer === 'object' && customer && 'email' in customer
                        ? customer.email
                        : null;
                // current_period_end was removed from Subscription root in newer API
                // versions and lives on subscription_items now.
                const firstItemAny = sub.items.data[0] as unknown as {
                    current_period_end?: number;
                };
                return {
                    id: sub.id,
                    status: sub.status,
                    customerEmail,
                    productName: product?.name || 'Unknown',
                    interval: price?.recurring?.interval || null,
                    unit_amount: price?.unit_amount || 0,
                    currency: price?.currency || 'usd',
                    created: sub.created,
                    current_period_end: firstItemAny?.current_period_end ?? null,
                    cancel_at_period_end: sub.cancel_at_period_end,
                };
            });

        return NextResponse.json({
            success: true,
            kpis: {
                mrr,
                arr,
                totalSubscriptions: enriched.length,
                activeCount,
                trialingCount,
                pastDueCount,
                canceledCount,
                incompleteCount,
                cancelAtPeriodEndCount,
                createdLast30,
                canceledLast30,
                churnRate30d,
            },
            planBreakdown: Array.from(planMap.values()).sort(
                (a, b) => b.monthlyValue - a.monthlyValue
            ),
            signupsByMonth,
            cancellationsByMonth,
            recent,
        });
    } catch (error: any) {
        console.error('Failed to compute subscription analytics:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to compute analytics' },
            { status: 500 }
        );
    }
}
