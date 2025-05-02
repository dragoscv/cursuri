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
    const { user, userPaidProducts = [], courses = {} } = useContext(AppContext) as AppContextProps;

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
                const q = query(paymentsRef, orderBy('created', 'desc'));
                const paymentsSnap = await getDocs(q);

                const paymentsList: Payment[] = [];

                paymentsSnap.forEach(doc => {
                    const paymentData = doc.data();
                    const courseId = paymentData.metadata?.courseId;
                    const course = courseId ? courses[courseId] : null;

                    const payment: Payment = {
                        id: doc.id,
                        courseId: courseId,
                        courseName: course?.name || 'Unknown Course',
                        productId: paymentData.items?.[0]?.price?.product || '',
                        amount: paymentData.amount_total / 100, // Convert cents to dollars/etc
                        currency: paymentData.currency?.toUpperCase() || 'USD',
                        formattedAmount: `${(paymentData.amount_total / 100).toFixed(2)} ${paymentData.currency?.toUpperCase() || 'USD'}`,
                        status: paymentData.status,
                        date: paymentData.created ? new Date(paymentData.created * 1000) : new Date(),
                        customerId: paymentData.customer,
                        paymentMethod: paymentData.payment_method_types?.[0] || 'card',
                        metadata: paymentData.metadata || {},
                    };

                    paymentsList.push(payment);
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
    }, [user, courses]);

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
