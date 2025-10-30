'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Chip, Input } from '@heroui/react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiDownload,
  FiFileText,
  FiCalendar,
  FiSearch,
  FiArrowDown,
  FiArrowUp,
} from '@/components/icons/FeatherIcons';
import usePaymentHistory from '@/components/Profile/hooks/usePaymentHistory';

export default function PaymentHistory() {
  const locale = useLocale();
  const t = useTranslations('payment');
  const tp = useTranslations('profile.paymentsPage');
  const context = useContext(AppContext);
  const { payments, loading, error, downloadInvoice } = usePaymentHistory();

  if (!context) {
    throw new Error('AppContext not found');
  }

  const { user } = context;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);

  // Process payment data
  useEffect(() => {
    if (!payments) {
      setFilteredPayments([]);
      return;
    }

    // Apply search filter
    let filtered = [...payments];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment?.productName?.toLowerCase().includes(term) ||
          payment?.courseName?.toLowerCase().includes(term) ||
          payment?.id?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      const dateA = a.date instanceof Date ? a.date : new Date(String(a.date));
      const dateB = b.date instanceof Date ? b.date : new Date(String(b.date));
      const comparison = dateA.getTime() - dateB.getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPayments(filtered);
  }, [payments, searchTerm, sortOrder]);

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    // Amount is already in whole units (not cents), check if it has decimals
    const hasDecimals = amount % 1 !== 0;

    // Use locale-specific formatting based on current locale
    const localeCode = locale === 'ro' ? 'ro-RO' : 'en-US';

    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--ai-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--ai-muted)]">{tp('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
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
              {tp('title')}
            </span>
          </h1>
          <p className="text-[color:var(--ai-muted)] max-w-2xl">{tp('description')}</p>
        </div>
        <div className="h-1 w-24 mt-4 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"></div>
      </motion.div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          className="md:max-w-xs shadow-sm border border-[color:var(--ai-card-border)] rounded-xl"
          placeholder={t('payment.search.placeholder')}
          startContent={<FiSearch className="text-[color:var(--ai-muted)]" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          radius="lg"
        />
        <div className="inline-flex gap-2 ml-auto">
          <Button
            className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition-all duration-300 rounded-xl"
            variant="flat"
            size="sm"
            radius="lg"
            endContent={
              <div className="bg-[color:var(--ai-primary)]/10 p-1 rounded-full">
                {sortOrder === 'asc' ? (
                  <FiArrowUp className="text-[color:var(--ai-primary)]" />
                ) : (
                  <FiArrowDown className="text-[color:var(--ai-primary)]" />
                )}
              </div>
            }
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? t('payment.sort.oldestFirst') : t('payment.sort.newestFirst')}
          </Button>
        </div>{' '}
      </div>

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
                        {tp('table.invoice')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                        {tp('table.product')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                        {tp('table.date')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                        {tp('table.amount')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                        {tp('table.status')}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                        {tp('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[color:var(--ai-card-bg)] divide-y divide-[color:var(--ai-card-border)]">
                    {filteredPayments.map((payment, index) => (
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
                            {payment.invoiceId || `INV-${payment.id.slice(0, 8).toUpperCase()}`}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-[color:var(--ai-foreground)]">
                          {payment.courseId ? (
                            <Link
                              href={`/courses/${payment.courseId}`}
                              className="text-[color:var(--ai-primary)] hover:text-[color:var(--ai-secondary)] transition-colors duration-200 hover:underline"
                            >
                              {payment.productName || payment.courseName}
                            </Link>
                          ) : (
                            <span className="text-[color:var(--ai-foreground)]">
                              {payment.productName || payment.courseName}
                            </span>
                          )}
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
                            className={
                              payment.status === 'succeeded'
                                ? 'bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)]'
                                : 'bg-[color:var(--ai-warning)]/10 text-[color:var(--ai-warning)]'
                            }
                            variant="flat"
                            size="sm"
                            radius="lg"
                          >
                            {payment.status === 'succeeded' ? tp('status.paid') : payment.status}
                          </Chip>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <Button
                            className="bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20 border border-[color:var(--ai-primary)]/20 transition-all duration-300 rounded-xl"
                            variant="flat"
                            size="sm"
                            radius="lg"
                            startContent={<FiDownload className="w-4 h-4" />}
                            onClick={async () => {
                              const invoiceUrl = await downloadInvoice(payment.id);
                              if (invoiceUrl) {
                                window.open(invoiceUrl, '_blank');
                              } else {
                                alert(tp('actions.invoiceError'));
                              }
                            }}
                          >
                            {tp('actions.invoice')}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>{' '}
          </Card>
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
              <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-3">
                {t('payment.emptyStates.noMatchingPayments')}
              </h3>
              <p className="text-[color:var(--ai-muted)] mb-6 max-w-md mx-auto">
                {t('payment.emptyStates.noMatchingPaymentsDesc')}
              </p>
              <Button
                className="bg-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/90 text-white transition-colors duration-300 rounded-xl"
                variant="solid"
                radius="lg"
                onClick={() => setSearchTerm('')}
              >
                {t('payment.emptyStates.clearSearch')}
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center">
                <FiFileText className="w-10 h-10 text-[color:var(--ai-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-3">
                {t('payment.emptyStates.noPaymentHistory')}
              </h3>
              <p className="text-[color:var(--ai-muted)] mb-6 max-w-md mx-auto">
                {t('payment.emptyStates.noPaymentHistoryDesc')}
              </p>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white hover:opacity-90 transition-opacity duration-300 rounded-xl" radius="lg">
                  {t('payment.emptyStates.browseCourses')}
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      )}

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
            <p className="mb-2 font-semibold text-[color:var(--ai-foreground)] text-base">
              {tp('help.title')}
            </p>
            <p className="text-[color:var(--ai-muted)]">
              {tp('help.description')}{' '}
              <a
                href={`mailto:${tp('help.email')}`}
                className="text-[color:var(--ai-primary)] hover:text-[color:var(--ai-secondary)] transition-colors duration-200 hover:underline"
              >
                {tp('help.email')}
              </a>
              .
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
