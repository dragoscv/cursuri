// Types for Stripe-related data used in the application

export interface StripePrice {
    unit_amount: number;
    currency: string;
    id: string;
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
