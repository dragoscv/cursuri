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
    };

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment History</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View your transaction history and download invoices.
                </p>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    className="md:max-w-xs"
                    placeholder="Search payments"
                    startContent={<FiSearch className="text-gray-400" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="inline-flex gap-2 ml-auto">
                    <Button
                        color="default"
                        variant="flat"
                        size="sm"
                        endContent={sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                    </Button>
                </div>
            </div>

            {/* Payments List */}
            {filteredPayments.length > 0 ? (
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Invoice
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {payment.invoiceId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                <Link
                                                    href={`/courses/${payment.courseId}`}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    {payment.courseName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <FiCalendar className="mr-2 text-gray-400" />
                                                    {formatDate(payment.date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Chip
                                                    color={payment.status === 'succeeded' ? 'success' : 'warning'}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {payment.status === 'succeeded' ? 'Paid' : payment.status}
                                                </Chip>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Button
                                                    color="default"
                                                    variant="light"
                                                    size="sm"
                                                    startContent={<FiDownload className="text-gray-600 dark:text-gray-400" />}
                                                    onClick={() => downloadInvoice(payment)}
                                                >
                                                    Invoice
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    {searchTerm ? (
                        <>
                            <FiSearch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching payments found</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search criteria.</p>
                            <Button
                                color="primary"
                                variant="light"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear Search
                            </Button>
                        </>
                    ) : (
                        <>
                            <FiFileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payment history yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't made any purchases yet.</p>
                            <Link href="/courses">
                                <Button color="primary">Browse Courses</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}

            {/* Help text */}
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="mb-2 font-medium">Need help with a payment?</p>
                <p>
                    If you have any questions about your payments or need assistance with refunds,
                    please contact our support team at <a href="mailto:support@cursuri.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@cursuri.com</a>.
                </p>
            </div>
        </div>
    );
}