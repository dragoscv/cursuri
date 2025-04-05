import { type FirebaseApp } from "firebase/app";
import {
    getStripePayments,
    getCurrentUserSubscription,
    getCurrentUserSubscriptions,
    StripePayments,
    getProducts,
    createCheckoutSession,
    firebaseApp
} from "firewand";


export const stripePayments = (firebaseApp: FirebaseApp): StripePayments => getStripePayments(firebaseApp, {
    productsCollection: "products",
    customersCollection: "/customers",
});

export const newCheckoutSession = async (priceId: string, promoCode?: string) => {
    const payments = stripePayments(firebaseApp);
    const paymentConfig: any = {
        price: priceId,
        allow_promotion_codes: true,
        success_url: `${window.location.href}?paymentStatus=success`,
        cancel_url: `${window.location.href}?paymentStatus=cancel`,
    }
    if (promoCode) {
        paymentConfig["promotion_code"] = promoCode;
    }

    try {
        const session = await createCheckoutSession(payments, paymentConfig);
        window.location.assign(session.url);
        return session;
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}