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