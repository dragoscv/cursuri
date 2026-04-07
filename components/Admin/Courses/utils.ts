import { CourseWithPriceProduct } from '@/types';

export function formatCoursePrice(course: CourseWithPriceProduct, locale: string = 'ro-RO'): string {
    // Check if course is free first
    if (course.isFree) {
        return 'Free';
    }

    // First, check if priceProduct exists with price information
    if (course.priceProduct?.prices?.length) {
        // Find the specific price matching course.price, fall back to first price
        const matchedPrice = (typeof course.price === 'string' && course.price.startsWith('price_'))
            ? course.priceProduct.prices.find(p => p.id === course.price)
            : undefined;
        const price = matchedPrice || course.priceProduct.prices[0];

        if (price.unit_amount !== undefined) {
            const amount = price.unit_amount / 100;
            const currency = price.currency?.toUpperCase() || 'RON';
            return amount.toLocaleString(locale, {
                style: 'currency',
                currency: currency,
            });
        }
    }

    // Second, check if there's a direct price field (number or string)
    if (course.price !== undefined && course.price !== null && course.price !== '') {
        // If price is a string that looks like a Stripe price ID, we need to fetch the actual price
        if (typeof course.price === 'string' && course.price.startsWith('price_')) {
            return 'Price configured';
        }

        // If price is a number or numeric string, format it
        const priceNum = typeof course.price === 'number' ? course.price : parseFloat(course.price);
        if (!isNaN(priceNum)) {
            const amount = priceNum < 100 && priceNum % 1 !== 0 ? priceNum : priceNum / 100;
            const currency = course.priceProduct?.prices?.[0]?.currency?.toUpperCase() || 'RON';
            return amount.toLocaleString(locale, {
                style: 'currency',
                currency: currency,
            });
        }
    }

    return 'Price not available';
}