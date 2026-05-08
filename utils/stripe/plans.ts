/**
 * Shared helpers for selecting the active Stripe product/price for a given
 * subscription tier. Used by the public /subscriptions page and by the
 * profile GitHub-accounts page so both flows always pick the same active
 * price (avoids stale "price is inactive" errors when admins replace prices).
 */

export type Tier = 'courses' | 'copilot';

export interface AnyProduct {
  id: string;
  name?: string;
  metadata?: Record<string, string>;
  prices?: any[];
  active?: boolean;
}

export function getProductTier(p: AnyProduct): Tier {
  const explicit = p.metadata?.tier;
  if (explicit === 'courses' || explicit === 'copilot') return explicit;
  // Backwards-compat: legacy "main plan" used to provision Copilot for everyone.
  if (p.metadata?.mainPlan === 'true') return 'copilot';
  return 'courses';
}

export function pickPriceForInterval(
  product: AnyProduct | undefined,
  interval: 'month' | 'year'
): any | null {
  if (!product?.prices) return null;
  const candidates = product.prices.filter((pr: any) => {
    if (pr.active === false) return false;
    const intv = pr.recurring?.interval || pr.metadata?.interval || pr.interval;
    return intv === interval;
  });
  if (candidates.length === 0) return null;
  const defaultOne = candidates.find((pr: any) => pr.metadata?.default === 'true');
  if (defaultOne) return defaultOne;
  return candidates.slice().sort((a: any, b: any) => (b.created || 0) - (a.created || 0))[0];
}

export function pickBestProduct(
  products: AnyProduct[] | null | undefined,
  tier: Tier
): AnyProduct | undefined {
  const list = (products || []).filter(
    (p) => p.active !== false && getProductTier(p) === tier
  );
  if (list.length === 0) return undefined;
  return (
    list.find((p) => p.metadata?.mainPlan === 'true') ||
    list.find((p) => p.metadata?.featured === 'true') ||
    list[0]
  );
}

/**
 * Resolve the active Copilot monthly price (id + metadata) from the loaded
 * Stripe products. Returns null when no active Copilot product/price exists.
 */
export function resolveCopilotMonthlyPrice(
  products: AnyProduct[] | null | undefined
): any | null {
  const product = pickBestProduct(products, 'copilot');
  return pickPriceForInterval(product, 'month');
}
