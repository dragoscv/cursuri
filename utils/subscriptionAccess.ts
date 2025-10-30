import { getCurrentUserSubscriptions } from 'firewand';
import { stripePayments } from './firebase/stripe';
import { firebaseApp } from './firebase/firebase.config';

/**
 * Check if the current user has an active subscription
 * @returns Promise<boolean> - true if user has active subscription, false otherwise
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const payments = stripePayments(firebaseApp);
    const subscriptions = await getCurrentUserSubscriptions(payments, {
      status: ['active', 'trialing'],
    });

    return subscriptions && subscriptions.length > 0;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Check if user has access to a course (purchased OR active subscription)
 * @param courseId - The ID of the course to check access for
 * @param userPaidProducts - Array of user's purchased products
 * @param checkSubscription - Whether to check for active subscription (default: true)
 * @returns Promise<boolean> - true if user has access, false otherwise
 */
export async function hasAccessToCourse(
  courseId: string,
  userPaidProducts: any[],
  checkSubscription: boolean = true
): Promise<boolean> {
  // Check if user purchased this specific course
  const hasPurchased = userPaidProducts?.some(
    (product) => product.metadata?.courseId === courseId
  );

  if (hasPurchased) {
    return true;
  }

  // Check if user has active subscription (grants access to all courses)
  if (checkSubscription) {
    return await hasActiveSubscription();
  }

  return false;
}

/**
 * Get the active subscription product ID
 * Used to identify which subscription product is active
 */
export const SUBSCRIPTION_PRODUCT_ID = 'prod_TKWQrufVSkN0Zr';

/**
 * Check if a product is a subscription product
 * @param productId - The product ID to check
 * @returns boolean - true if product is a subscription
 */
export function isSubscriptionProduct(productId: string): boolean {
  return productId === SUBSCRIPTION_PRODUCT_ID;
}
