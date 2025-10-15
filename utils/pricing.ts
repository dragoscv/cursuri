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

    // Check if we have price product information
    if (!course?.priceProduct) {
        console.log('getCoursePrice: No priceProduct found for course', course?.id);
        return defaultPriceInfo;
    }

    // Method 1: Try to find price using course.price ID (more specific)
    if (course.price && products) {
        const product = products.find((p: any) => p.id === course.priceProduct.id);
        if (product?.prices) {
            const specificPrice = product.prices.find((price: any) => price.id === course.price);
            if (specificPrice?.unit_amount) {
                const amount = specificPrice.unit_amount / 100;
                const currency = specificPrice.currency?.toUpperCase() || 'RON';
                return {
                    amount,
                    currency,
                    priceId: specificPrice.id,
                    formatted: new Intl.NumberFormat('ro-RO', {
                        style: 'currency',
                        currency: currency
                    }).format(amount)
                };
            }
        }
    }

    // Method 2: Use first available price from priceProduct (fallback)
    if (course.priceProduct.prices?.[0]?.unit_amount) {
        const price = course.priceProduct.prices[0];
        const amount = price.unit_amount / 100;
        const currency = price.currency?.toUpperCase() || 'RON';
        return {
            amount,
            currency,
            priceId: price.id,
            formatted: new Intl.NumberFormat('ro-RO', {
                style: 'currency',
                currency: currency
            }).format(amount)
        };
    }

    // Method 3: Check if course has a direct price property (legacy support)
    if (typeof course.price === 'number' && course.price > 0) {
        return {
            amount: course.price,
            currency: 'RON',
            priceId: '',
            formatted: new Intl.NumberFormat('ro-RO', {
                style: 'currency',
                currency: 'RON'
            }).format(course.price)
        };
    }

    // Method 4: Check if course has a direct price string (legacy support)  
    if (typeof course.price === 'string' && course.price !== '' && !course.price.startsWith('price_')) {
        const numericPrice = parseFloat(course.price);
        if (!isNaN(numericPrice) && numericPrice > 0) {
            return {
                amount: numericPrice,
                currency: 'RON',
                priceId: '',
                formatted: new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON'
                }).format(numericPrice)
            };
        }
    }

    console.log('getCoursePrice: Unable to determine price for course', course?.id, {
        hasPrice: !!course?.price,
        hasPriceProduct: !!course?.priceProduct,
        priceType: typeof course?.price,
        priceValue: course?.price
    });

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