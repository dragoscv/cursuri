import { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';

export interface Payment {
    id: string;
    courseId?: string;
    courseName?: string;
    productId?: string;
    productName?: string;
    amount?: number;
    currency?: string;
    formattedAmount?: string;
    status?: string;
    date?: string | Date | Timestamp;
    customerId?: string;
    invoiceId?: string;
    invoiceUrl?: string;
    paymentMethod?: string;
    metadata?: Record<string, any>;
}

export interface PaymentHistoryData {
    payments: Payment[];
    loading: boolean;
    error: string | null;
    downloadInvoice: (paymentId: string) => Promise<string | null>;
}

export default function usePaymentHistory(): PaymentHistoryData {
    const { user, userPaidProducts = [], courses = {}, products = [], subscriptions = [] } = useContext(AppContext) as AppContextProps;

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPaymentHistory() {
            if (!user) {
                setPayments([]);
                setLoading(false);
                return;
            }

            try {
                // Get payments from Firestore
                const paymentsRef = collection(firestoreDB, `customers/${user.uid}/payments`);
                // Note: We'll sort in memory since different sources use different field names
                const paymentsSnap = await getDocs(paymentsRef);

                const paymentsList: Payment[] = [];

                paymentsSnap.forEach(doc => {
                    const paymentData = doc.data();

                    // Support both Stripe extension format and custom format
                    const courseId = paymentData.metadata?.courseId || paymentData.courseId;
                    const course = courseId ? courses[courseId] : null;

                    // Get product ID from multiple possible locations
                    let productId = paymentData.items?.[0]?.price?.product ||
                        paymentData.productId ||
                        paymentData.product ||
                        paymentData.metadata?.productId ||
                        paymentData.lines?.data?.[0]?.price?.product ||
                        '';

                    // Extract product ID from Firestore price reference if present
                    if (!productId && paymentData.prices?.[0]) {
                        const priceRef = paymentData.prices[0];
                        // The referencePath is a plain string property in the Firestore extension format
                        const referencePath = priceRef.referencePath;

                        if (referencePath && typeof referencePath === 'string') {
                            const match = referencePath.match(/products\/([^\/]+)/);
                            if (match) {
                                productId = match[1];
                            }
                        }
                    }

                    // For payment intents, use active subscription's product if description is "Subscription creation"
                    if (!productId && paymentData.description === 'Subscription creation' && subscriptions.length > 0) {
                        // Find active subscription with matching customer
                        const activeSubscription = subscriptions.find(s =>
                            s.status === 'active' && s.product?.id
                        );
                        if (activeSubscription) {
                            productId = activeSubscription.product.id;
                        }
                    }

                    // For other payment intents, try matching by description
                    if (!productId && paymentData.description && paymentData.description !== 'Subscription creation') {
                        const description = paymentData.description.toLowerCase();

                        const matchedSubscription = subscriptions.find(s =>
                            s.product?.name && description.includes(s.product.name.toLowerCase())
                        );

                        if (matchedSubscription && matchedSubscription.product?.id) {
                            productId = matchedSubscription.product.id;
                        } else {
                            const matchedProduct = products.find(p =>
                                p.name && description.includes(p.name.toLowerCase())
                            );
                            if (matchedProduct) {
                                productId = matchedProduct.id;
                            }
                        }
                    }

                    // Find product or subscription name
                    let productName = 'Unknown Product';

                    if (course) {
                        // Check if it's a course
                        productName = course.name;
                    } else if (productId) {
                        // Check subscriptions first (most common for subscription payments)
                        const subscription = subscriptions.find(s => s.product?.id === productId || s.id === productId);
                        if (subscription && subscription.product) {
                            productName = subscription.product.name || 'Subscription';
                        } else {
                            // Check products
                            const product = products.find(p => p.id === productId);
                            if (product) {
                                productName = product.name || 'Product';
                            }
                        }
                    } else if (paymentData.description && paymentData.description !== 'Subscription creation') {
                        // Use description as fallback (but not generic ones)
                        productName = paymentData.description;
                    }

                    // Handle amount - amounts in database are stored without decimals (in cents/bani)
                    // We need to divide by 100 to get the actual currency amount
                    const rawAmount = paymentData.amount_total ?? paymentData.amount ?? 0;
                    const amount = rawAmount / 100;

                    // Handle currency
                    const currency = (paymentData.currency || 'RON').toUpperCase();

                    // Handle date - Stripe extension uses created (timestamp), custom format uses createdAt (ISO string)
                    let date: Date;
                    if (paymentData.created) {
                        date = new Date(paymentData.created * 1000);
                    } else if (paymentData.createdAt) {
                        date = typeof paymentData.createdAt === 'string'
                            ? new Date(paymentData.createdAt)
                            : paymentData.createdAt.toDate();
                    } else {
                        date = new Date();
                    }

                    const payment: Payment = {
                        id: doc.id,
                        courseId: courseId,
                        courseName: course?.name || 'Unknown Course',
                        productId: productId,
                        productName: productName,
                        amount: amount,
                        currency: currency,
                        formattedAmount: `${amount.toFixed(2)} ${currency}`,
                        status: paymentData.status,
                        date: date,
                        customerId: paymentData.customer,
                        paymentMethod: paymentData.payment_method_types?.[0] || 'card',
                        metadata: paymentData.metadata || {},
                    };

                    paymentsList.push(payment);
                });

                // Sort by date in descending order
                paymentsList.sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : (a.date && typeof a.date === 'object' && 'toDate' in a.date ? a.date.toDate() : new Date(a.date!));
                    const dateB = b.date instanceof Date ? b.date : (b.date && typeof b.date === 'object' && 'toDate' in b.date ? b.date.toDate() : new Date(b.date!));
                    return dateB.getTime() - dateA.getTime();
                });

                setPayments(paymentsList);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching payment history:", err);
                setError("Failed to load payment history");
                setLoading(false);
            }
        }

        fetchPaymentHistory();
    }, [user, courses, products, subscriptions]);

    const downloadInvoice = async (paymentId: string): Promise<string | null> => {
        if (!user) return null;

        try {
            // Find the payment in our existing array
            const payment = payments.find(p => p.id === paymentId);
            if (!payment) return null;

            // If we already have an invoice URL, return it
            if (payment.invoiceUrl) return payment.invoiceUrl;

            // Otherwise, generate an invoice via our API
            const response = await fetch('/api/invoice/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentId,
                    userId: user.uid,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate invoice');
            }

            const { invoiceUrl } = await response.json();

            // Update the payment in our state with the invoice URL
            setPayments(prevPayments =>
                prevPayments.map(p =>
                    p.id === paymentId ? { ...p, invoiceUrl } : p
                )
            );

            return invoiceUrl;
        } catch (err) {
            console.error("Error generating invoice:", err);
            return null;
        }
    };

    return {
        payments,
        loading,
        error,
        downloadInvoice
    };
}
