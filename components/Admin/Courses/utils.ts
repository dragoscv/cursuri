import { CourseWithPriceProduct } from '@/types';

export function formatCoursePrice(course: CourseWithPriceProduct): string {
    if (course.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
        const amount = course.priceProduct.prices[0].unit_amount / 100;
        const currency = course.priceProduct.prices[0].currency || 'RON';
        return amount.toLocaleString('ro-RO', {
            style: 'currency',
            currency: currency,
        });
    }
    return 'Price not available';
}