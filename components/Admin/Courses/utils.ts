import { CourseWithPriceProduct } from '@/types';
import { getCoursePrice } from '@/utils/pricing';

export function formatCoursePrice(course: CourseWithPriceProduct, locale: string = 'ro-RO', products?: any[]): string {
    if (course.isFree) {
        return 'Free';
    }

    const priceInfo = getCoursePrice(course, products);
    if (priceInfo.amount > 0) {
        return priceInfo.amount.toLocaleString(locale, {
            style: 'currency',
            currency: priceInfo.currency,
        });
    }

    // If price is a Stripe ID but couldn't be resolved
    if (typeof course.price === 'string' && course.price.startsWith('price_')) {
        return 'Price configured';
    }

    return 'Price not available';
}