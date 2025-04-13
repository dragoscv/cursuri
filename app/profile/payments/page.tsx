'use client'

import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Button, Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiDownload, FiFileText, FiCalendar, FiSearch, FiChevronDown, FiFilter, FiArrowDown, FiArrowUp } from '@/components/icons/FeatherIcons';

export default function PaymentHistory() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, courses, userPaidProducts } = context;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filteredPayments, setFilteredPayments] = useState<any[]>([]);

    // Process payment data
    useEffect(() => {
        if (!userPaidProducts || !courses) {
            setFilteredPayments([]);
            return;
        }

        // Create enhanced payment objects with course info
        const enhancedPayments = userPaidProducts.map(payment => {
            const courseId = payment.metadata?.courseId;
            const course = courseId ? courses[courseId] : undefined;

            if (!course) return null;

            // Extract the price amount
            const priceAmount = course.priceProduct?.prices?.[0]?.unit_amount || 0;
            const currency = course.priceProduct?.prices?.[0]?.currency || 'RON';

            return {
                id: payment.id,
                courseId,
                courseName: course.name,
                date: payment.created ? new Date(payment.created * 1000) : new Date(),
                amount: priceAmount / 100, // Convert from cents to whole currency
                currency,
                status: payment.status,
                invoiceId: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
            };
        }).filter(Boolean);

        // Apply search filter
        let filtered = enhancedPayments;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(payment =>
                payment?.courseName.toLowerCase().includes(term) ||
                payment?.invoiceId.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (!a || !b) return 0;
            const comparison = a.date.getTime() - b.date.getTime();
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredPayments(filtered);
    }, [userPaidProducts, courses, searchTerm, sortOrder]);

    // Function to generate and download an invoice
    const downloadInvoice = (payment: any) => {
        // This would typically call an API to generate an invoice PDF
        // For now, we'll just simulate it with an alert

        alert(`Invoice ${payment.invoiceId} for ${payment.courseName} would be downloaded now.`);

        // In a real implementation, you might do something like:
        // 1. Call an API endpoint that generates the PDF
        // 2. Get the PDF binary data or URL
        // 3. Trigger a download using that data or URL
    };

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    // Format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }; if (!user) {
        return null;
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]">
                            Payment History
                        </span>
                    </h1>
                    <p className="text-[color:var(--ai-muted)] max-w-2xl">
                        View your transaction history and download invoices for all your course purchases.
                    </p>
                </div>
                <div className="h-1 w-24 mt-4 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"></div>
            </motion.div>

            {/* Filters and search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Input
                    className="md:max-w-xs shadow-sm border border-[color:var(--ai-card-border)]"
                    placeholder="Search payments"
                    startContent={<FiSearch className="text-[color:var(--ai-muted)]" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="inline-flex gap-2 ml-auto">
                    <Button
                        className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition-all duration-300"
                        variant="flat"
                        size="sm"
                        endContent={
                            <div className="bg-[color:var(--ai-primary)]/10 p-1 rounded-full">
                                {sortOrder === 'asc' ? <FiArrowUp className="text-[color:var(--ai-primary)]" /> :
                                    <FiArrowDown className="text-[color:var(--ai-primary)]" />}
                            </div>
                        }
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                    </Button>
                </div>            </div>

            {/* Payments List */}
            {filteredPayments.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden">
                        <div className="h-0.5 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/40 via-[color:var(--ai-secondary)]/40 to-[color:var(--ai-accent)]/40"></div>
                        <CardBody className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full">
                                    <thead className="bg-[color:var(--ai-card-bg)]/80 border-b border-[color:var(--ai-card-border)]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                                                Invoice
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[color:var(--ai-card-bg)] divide-y divide-[color:var(--ai-card-border)]">                                    {filteredPayments.map((payment, index) => (
                                        <motion.tr
                                            key={payment.id}
                                            className="hover:bg-[color:var(--ai-primary)]/5 transition-colors duration-200"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-[color:var(--ai-foreground)] font-mono">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] rounded-full mr-2">
                                                        <FiFileText className="w-4 h-4" />
                                                    </div>
                                                    {payment.invoiceId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-[color:var(--ai-foreground)]">
                                                <Link
                                                    href={`/courses/${payment.courseId}`}
                                                    className="text-[color:var(--ai-primary)] hover:text-[color:var(--ai-secondary)] transition-colors duration-200 hover:underline"
                                                >
                                                    {payment.courseName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-[color:var(--ai-foreground)]">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] rounded-full mr-2">
                                                        <FiCalendar className="w-4 h-4" />
                                                    </div>
                                                    {formatDate(payment.date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-[color:var(--ai-foreground)]">
                                                <div className="font-mono bg-[color:var(--ai-card-bg)]/80 py-1.5 px-3 rounded-lg inline-flex">
                                                    {formatCurrency(payment.amount, payment.currency)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <Chip
                                                    className={payment.status === 'succeeded'
                                                        ? "bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] border border-[color:var(--ai-success)]/20"
                                                        : "bg-[color:var(--ai-warning)]/10 text-[color:var(--ai-warning)] border border-[color:var(--ai-warning)]/20"
                                                    }
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {payment.status === 'succeeded' ? 'Paid' : payment.status}
                                                </Chip>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <Button
                                                    className="bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20 border border-[color:var(--ai-primary)]/20 transition-all duration-300"
                                                    variant="flat"
                                                    size="sm"
                                                    startContent={<FiDownload className="w-4 h-4" />}
                                                    onClick={() => downloadInvoice(payment)}
                                                >
                                                    Invoice
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-16 px-8 bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)] shadow-lg"
                >
                    {searchTerm ? (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center">
                                <FiSearch className="w-10 h-10 text-[color:var(--ai-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-3">No matching payments found</h3>
                            <p className="text-[color:var(--ai-muted)] mb-6 max-w-md mx-auto">We couldn't find any payments that match your search. Try adjusting your search criteria.</p>
                            <Button
                                className="bg-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/90 text-white transition-colors duration-300"
                                variant="solid"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear Search
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center">
                                <FiFileText className="w-10 h-10 text-[color:var(--ai-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-3">No payment history yet</h3>
                            <p className="text-[color:var(--ai-muted)] mb-6 max-w-md mx-auto">You haven&apos;t made any purchases yet. Start exploring our courses to find the perfect learning opportunity!</p>
                            <Link href="/courses">
                                <Button className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white hover:opacity-90 transition-opacity duration-300">
                                    Browse Courses
                                </Button>
                            </Link>
                        </>
                    )}
                </motion.div>)}

            {/* Help text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 text-sm bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm p-6 rounded-xl border border-[color:var(--ai-card-border)] shadow-md"
            >
                <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FiFileText className="w-5 h-5 text-[color:var(--ai-primary)]" />
                    </div>
                    <div>
                        <p className="mb-2 font-semibold text-[color:var(--ai-foreground)] text-base">Need help with a payment?</p>
                        <p className="text-[color:var(--ai-muted)]">
                            If you have any questions about your payments or need assistance with refunds,
                            please contact our support team at <a href="mailto:support@cursuri.com" className="text-[color:var(--ai-primary)] hover:text-[color:var(--ai-secondary)] transition-colors duration-200 hover:underline">support@cursuri.com</a>.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}