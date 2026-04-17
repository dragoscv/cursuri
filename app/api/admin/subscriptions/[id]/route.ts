import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { requireAdmin, checkRateLimit } from '@/utils/api/auth';
import { logAdminAction } from '@/utils/auditLog';
import { validateRequestBody } from '@/utils/security/inputValidation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/subscriptions/[id] — fetch one subscription with expanded
 * customer & first item price.
 */
export async function GET(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await ctx.params;

    try {
        const sub = await stripe.subscriptions.retrieve(id, {
            expand: ['customer', 'items.data.price.product', 'latest_invoice'],
        });
        return NextResponse.json({ success: true, subscription: sub });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Subscription not found' },
            { status: 404 }
        );
    }
}

/**
 * PATCH /api/admin/subscriptions/[id]
 *
 * Supported actions:
 *   - { action: 'cancel_at_period_end' } — schedule cancellation at the end
 *     of the current billing period (most user-friendly)
 *   - { action: 'cancel_now' }            — cancel immediately, prorating
 *     unused time as a credit on the customer
 *   - { action: 'resume' }                — clear `cancel_at_period_end`
 */
const ActionSchema = z.object({
    action: z.enum(['cancel_at_period_end', 'cancel_now', 'resume']),
    /** Optional reason captured in audit log + Stripe metadata */
    reason: z.string().max(500).optional(),
});

export async function PATCH(request: NextRequest, ctx: RouteContext) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const allowed = await checkRateLimit(`admin-sub-action:${user.uid}`, 30, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = await ctx.params;
    const validation = await validateRequestBody(request, ActionSchema);
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: validation.errors },
            { status: 400 }
        );
    }

    const { action, reason } = validation.data!;

    try {
        let result: Stripe.Subscription;
        const auditMeta: Record<string, string> = {
            action,
            ...(reason ? { reason } : {}),
            adminUid: user.uid,
        };

        if (action === 'cancel_at_period_end') {
            result = await stripe.subscriptions.update(id, {
                cancel_at_period_end: true,
                metadata: { ...auditMeta },
            });
        } else if (action === 'cancel_now') {
            result = await stripe.subscriptions.cancel(id, {
                prorate: true,
                invoice_now: false,
            });
        } else {
            // resume: clear cancel_at_period_end
            result = await stripe.subscriptions.update(id, {
                cancel_at_period_end: false,
                metadata: { ...auditMeta, resumedAt: String(Date.now()) },
            });
        }

        await logAdminAction(
            'stripe_subscription_action',
            request,
            user,
            'stripe_subscription',
            id,
            { action, reason: reason ?? null, status: result.status },
            true
        );

        return NextResponse.json({ success: true, subscription: result });
    } catch (error: any) {
        console.error('Subscription action failed:', error);
        await logAdminAction(
            'stripe_subscription_action_failed',
            request,
            user,
            'stripe_subscription',
            id,
            { action, error: error.message },
            false
        );
        return NextResponse.json(
            { error: error.message || 'Action failed' },
            { status: 500 }
        );
    }
}
