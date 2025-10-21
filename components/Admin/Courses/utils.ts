import { CourseWithPriceProduct } from '@/types';

export function formatCoursePrice(course: CourseWithPriceProduct, locale: string = 'ro-RO'): string {
    if (course.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
        const amount = course.priceProduct.prices[0].unit_amount / 100;
        const currency = course.priceProduct.prices[0].currency || 'RON';
        return amount.toLocaleString(locale, {
            style: 'currency',
            currency: currency,
        });
    }
    return 'Price not available';
}