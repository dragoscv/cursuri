// Types for Stripe-related data used in the application

export interface StripePrice {
    unit_amount: number;
    currency: string;
    id: string;
    recurring?: {
        interval: 'month' | 'year' | 'week' | 'day';
        interval_count: number;
    };
}

export interface StripeProduct {
    id: string;
    prices: StripePrice[];
    name?: string;
    description?: string;
    metadata?: Record<string, string>;
}

export interface PriceProductPair {
    price: string;
    priceProduct: StripeProduct;
}

// Raw subscription from Firewand (before enrichment)
export interface RawSubscription {
    id: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
    price: string; // Price ID
    product: string; // Product ID
    current_period_start: string; // GMT string date
    current_period_end: string; // GMT string date
    cancel_at_period_end: boolean;
    metadata?: Record<string, any>;
}

// Enriched subscription (after fetching full product and price data)
export interface EnrichedSubscription {
    id: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
    price: StripePrice; // Full price object
    product: StripeProduct; // Full product object
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    metadata?: Record<string, any>;
}
