import React, { useState } from 'react';
import { Card, CardBody, Button, Spinner, Tooltip } from '@heroui/react';
import { FiCreditCard, FiDownload, FiAlertCircle, FiSearch } from '@/components/icons/FeatherIcons';
import usePaymentHistory from './hooks/usePaymentHistory';
import { motion } from 'framer-motion';

export default function PaymentHistorySection() {
    const { payments, loading, error, downloadInvoice } = usePaymentHistory();
    const [downloadingInvoices, setDownloadingInvoices] = useState<Record<string, boolean>>({});

    // Function to handle invoice download
    const handleDownloadInvoice = async (paymentId: string) => {
        setDownloadingInvoices(prev => ({ ...prev, [paymentId]: true }));

        try {
            const invoiceUrl = await downloadInvoice(paymentId);

            if (invoiceUrl) {
                // Create temporary link for download
                const a = document.createElement('a');
                a.href = invoiceUrl;
                a.download = `invoice-${paymentId.substring(0, 8)}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error("Error downloading invoice:", err);
        } finally {
            setDownloadingInvoices(prev => ({ ...prev, [paymentId]: false }));
        }
    };

    // Format date for display
    const formatDate = (dateStr: string | Date) => {
        if (!dateStr) return 'Unknown';

        const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-white dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-secondary)] via-[color:var(--ai-accent)] to-[color:var(--ai-primary)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-secondary)]/10">
                            <FiCreditCard className="text-[color:var(--ai-secondary)]" />
                        </span>
                        Payment History
                    </h2>
                    <div className="flex justify-center py-6">
                        <Spinner color="primary" />
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-white dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-error)] to-[color:var(--ai-error-dark)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-secondary)]/10">
                            <FiCreditCard className="text-[color:var(--ai-secondary)]" />
                        </span>
                        Payment History
                    </h2>
                    <div className="text-[color:var(--ai-error)] flex items-center gap-2">
                        <FiAlertCircle />
                        <span>Failed to load payment history. Please try again later.</span>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-white dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
            <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-secondary)] via-[color:var(--ai-accent)] to-[color:var(--ai-primary)]"></div>
            <CardBody className="p-6">
                <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-[color:var(--ai-secondary)]/10">
                        <FiCreditCard className="text-[color:var(--ai-secondary)]" />
                    </span>
                    Payment History
                </h2>

                {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-[color:var(--ai-muted)] border-b border-[color:var(--ai-card-border)]/20">
                                    <th className="py-2 pr-4">Course</th>
                                    <th className="py-2 pr-4">Amount</th>
                                    <th className="py-2 pr-4">Date</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2 pr-4">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, index) => (
                                    <motion.tr
                                        key={payment.id}
                                        className="border-b border-[color:var(--ai-card-border)]/10"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <td className="py-2 pr-4 font-medium text-[color:var(--ai-foreground)]">
                                            {payment.courseName}
                                        </td>
                                        <td className="py-2 pr-4">{payment.formattedAmount}</td>
                                        <td className="py-2 pr-4">{formatDate(payment.date as Date)}</td>
                                        <td className="py-2 pr-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${payment.status === 'succeeded' ? 'bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)]' :
                                                    payment.status === 'processing' ? 'bg-[color:var(--ai-warning)]/10 text-[color:var(--ai-warning)]' :
                                                        'bg-[color:var(--ai-error)]/10 text-[color:var(--ai-error)]'}`}
                                            >
                                                {payment.status === 'succeeded' ? 'Paid' :
                                                    payment.status === 'processing' ? 'Processing' :
                                                        'Failed'}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4">
                                            {payment.status === 'succeeded' ? (
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    isDisabled={downloadingInvoices[payment.id]}
                                                    onClick={() => handleDownloadInvoice(payment.id)}
                                                    startContent={
                                                        downloadingInvoices[payment.id] ?
                                                            <Spinner size="sm" /> :
                                                            <FiDownload size={16} />
                                                    }
                                                >
                                                    {downloadingInvoices[payment.id] ? 'Generating...' : 'Download'}
                                                </Button>
                                            ) : (
                                                <Tooltip content="Invoice available after payment is completed">
                                                    <span className="text-[color:var(--ai-muted)] flex items-center gap-1">
                                                        <FiDownload size={16} />
                                                        Unavailable
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center">
                        <div className="w-16 h-16 mx-auto bg-[color:var(--ai-muted)]/10 rounded-full flex items-center justify-center mb-4">
                            <FiSearch className="text-[color:var(--ai-secondary)]" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-[color:var(--ai-foreground)] mb-2">No Payment Records Found</h3>
                        <p className="text-[color:var(--ai-muted)] mb-4">Your purchase history will appear here once you buy a course.</p>
                        <Button
                            as="a"
                            href="/courses"
                            color="primary"
                            variant="solid"
                        >
                            Browse Courses
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
