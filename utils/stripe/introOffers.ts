import Stripe from 'stripe';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'cursuri';

export interface IntroOfferInput {
    /** Promo price for the first N period(s), in the smallest currency unit (cents/bani). */
    unit_amount: number;
    /** Number of billing periods the intro price applies for (1..12). */
    months: number;
}

export interface IntroOfferResult {
    couponId: string;
    promotionCodeId: string;
    /** Discount per period, in smallest currency unit. */
    amountOff: number;
    months: number;
}

/**
 * Detach (and best-effort delete) the coupon + promotion code currently
 * attached to a Stripe price's metadata, if any. Safe to call when no offer
 * is currently set.
 */
export async function detachIntroOffer(
    stripe: Stripe,
    priceMetadata: Record<string, string> | null | undefined
): Promise<void> {
    if (!priceMetadata) return;
    const promoId = priceMetadata.intro_promotion_code;
    const couponId = priceMetadata.intro_coupon;
    if (promoId) {
        try {
            await stripe.promotionCodes.update(promoId, { active: false });
        } catch {
            // ignore — the promo code may have been deleted already
        }
    }
    if (couponId) {
        try {
            await stripe.coupons.del(couponId);
        } catch {
            // ignore — coupon may have been deleted or is in use
        }
    }
}

/**
 * Create a Stripe Coupon + hidden Promotion Code that, when applied to a
 * subscription on `price`, charges `intro.unit_amount` for the first
 * `intro.months` billing periods, then reverts to the regular price.
 *
 * The coupon is currency-locked to the price's currency. Throws if the intro
 * amount is not strictly less than the regular price.
 */
export async function createIntroOffer(
    stripe: Stripe,
    price: Stripe.Price,
    intro: IntroOfferInput
): Promise<IntroOfferResult> {
    if (price.unit_amount == null) {
        throw new Error('Cannot attach intro offer to a price with no unit_amount.');
    }
    if (intro.unit_amount < 0) {
        throw new Error('Intro amount must be non-negative.');
    }
    if (intro.unit_amount >= price.unit_amount) {
        throw new Error('Intro amount must be lower than the regular price.');
    }
    if (intro.months < 1 || intro.months > 12) {
        throw new Error('Intro duration must be between 1 and 12 months.');
    }

    const amountOff = price.unit_amount - intro.unit_amount;

    const coupon = await stripe.coupons.create({
        amount_off: amountOff,
        currency: price.currency,
        duration: intro.months === 1 ? 'once' : 'repeating',
        duration_in_months: intro.months === 1 ? undefined : intro.months,
        name: `Intro: first ${intro.months} mo @ ${(intro.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`,
        metadata: {
            app: APP_NAME,
            price: price.id,
            product: typeof price.product === 'string' ? price.product : price.product?.id || '',
            intro_amount: String(intro.unit_amount),
            intro_months: String(intro.months),
        },
    });

    const promotionCode = await stripe.promotionCodes.create({
        promotion: { type: 'coupon', coupon: coupon.id },
        active: true,
        metadata: {
            app: APP_NAME,
            price: price.id,
            kind: 'intro',
        },
    });

    return {
        couponId: coupon.id,
        promotionCodeId: promotionCode.id,
        amountOff,
        months: intro.months,
    };
}
