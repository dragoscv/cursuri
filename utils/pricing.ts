/**
 * Unified pricing utilities to ensure consistent price display across the app
 */

export interface PriceInfo {
    amount: number;
    currency: string;
    priceId: string;
    formatted: string;
}

/**
 * Get standardized price information for a course
 * This ensures consistent pricing across all components
 */
export function getCoursePrice(course: any, products?: any[]): PriceInfo {
    // Default fallback values
    const defaultPriceInfo: PriceInfo = {
        amount: 0,
        currency: 'RON',
        priceId: '',
        formatted: 'Free'
    };

    // Handle free courses
    if (course?.isFree) {
        return { ...defaultPriceInfo, formatted: 'Free' };
    }

    const priceId = course?.price;
    const isStripePriceId = typeof priceId === 'string' && priceId.startsWith('price_');

    // Helper: format a resolved price object into PriceInfo
    const formatPriceInfo = (p: any): PriceInfo => {
        const amount = p.unit_amount / 100;
        const currency = p.currency?.toUpperCase() || 'RON';
        return {
            amount,
            currency,
            priceId: p.id,
            formatted: new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(amount)
        };
    };

    // Helper: search all products for a specific price ID
    const findPriceInProducts = (id: string): any | undefined => {
        if (!products?.length) return undefined;
        for (const product of products) {
            const found = product.prices?.find((p: any) => p.id === id);
            if (found) return found;
        }
        return undefined;
    };

    // Method 1: Match course.price to the exact Stripe price (most reliable)
    if (isStripePriceId) {
        // Try from enriched priceProduct first
        const fromEnriched = course?.priceProduct?.prices?.find((p: any) => p.id === priceId);
        if (fromEnriched?.unit_amount != null) return formatPriceInfo(fromEnriched);

        // Fall back to searching the raw products array
        const fromProducts = findPriceInProducts(priceId);
        if (fromProducts?.unit_amount != null) return formatPriceInfo(fromProducts);
    }

    // Method 2: Use first available price from enriched priceProduct
    if (course?.priceProduct?.prices?.[0]?.unit_amount != null) {
        return formatPriceInfo(course.priceProduct.prices[0]);
    }

    // Method 3: Direct numeric price (legacy)
    if (typeof course?.price === 'number' && course.price > 0) {
        return {
            amount: course.price,
            currency: 'RON',
            priceId: '',
            formatted: new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(course.price)
        };
    }

    // Method 4: Direct numeric string price (legacy)
    if (typeof course?.price === 'string' && course.price !== '' && !course.price.startsWith('price_')) {
        const numericPrice = parseFloat(course.price);
        if (!isNaN(numericPrice) && numericPrice > 0) {
            return {
                amount: numericPrice,
                currency: 'RON',
                priceId: '',
                formatted: new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(numericPrice)
            };
        }
    }

    return defaultPriceInfo;
}

/**
 * Format a price amount with currency
 */
export function formatPrice(amount: number, currency: string = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: currency.toUpperCase()
    }).format(amount);
}

/**
 * Validate if a course has valid pricing information
 */
export function hasValidPrice(course: any): boolean {
    const priceInfo = getCoursePrice(course);
    return priceInfo.amount > 0 || !!course?.isFree;
}