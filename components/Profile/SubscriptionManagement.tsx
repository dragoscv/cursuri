'use client';

import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  FiCheck,
  FiClock,
  FiCreditCard,
  FiAlertCircle,
  FiArrowRight,
} from '@/components/icons/FeatherIcons';
import { createPortalLink } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Link from 'next/link';
import { logSubscriptionView, logSubscriptionCancellation, logSubscriptionPurchase } from '@/utils/analytics';
import { trackSubscriptionEvent, trackRevenue } from '@/utils/statistics';

export default function SubscriptionManagement() {
  const t = useTranslations('subscription.manage');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  const [creatingPortalLink, setCreatingPortalLink] = useState<string | null>(null);

  if (!context) {
    throw new Error('SubscriptionManagement must be used within AppContextProvider');
  }

  const { user, subscriptions, subscriptionsLoading } = context;

  // Track subscription management page view
  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      const activeSubscription = subscriptions.find((s: any) => s.status === 'active');
      if (activeSubscription && activeSubscription.product?.name) {
        logSubscriptionView(activeSubscription.product.name);
      }
    }
  }, [subscriptions]);

  // Check for subscription success/cancellation from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    if (status === 'success' && user) {
      // Try to get data from URL params first (most reliable)
      const planFromUrl = urlParams.get('plan');
      const amountFromUrl = urlParams.get('amount');
      const currencyFromUrl = urlParams.get('currency');
      const intervalFromUrl = urlParams.get('interval');

      if (planFromUrl && amountFromUrl && currencyFromUrl && intervalFromUrl) {
        // Use URL params (more reliable than subscription data which may not be loaded yet)
        const amount = parseFloat(amountFromUrl);
        const currency = currencyFromUrl.toUpperCase();
        const interval = intervalFromUrl;

        // Generate transaction ID from timestamp and user ID
        const transactionId = `sub_${user.uid}_${Date.now()}`;

        // Track successful subscription purchase in Firebase Analytics
        logSubscriptionPurchase(planFromUrl, amount, currency, interval, transactionId);

        // Track in Firestore database
        trackSubscriptionEvent(user.uid, 'subscribe', planFromUrl, amount).catch(error => {
          console.error('Failed to track subscription event in Firestore:', error);
        });

        // Track revenue
        trackRevenue(amount, currency, 'subscription', transactionId).catch(error => {
          console.error('Failed to track revenue:', error);
        });

        // Clear URL params after a short delay to ensure tracking completes
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
        }, 2000);
      } else if (subscriptions && subscriptions.length > 0) {
        // Fallback: use subscription data if available
        const latestSubscription = subscriptions[0];

        const planName = latestSubscription.product?.name || 'subscription';

        // Handle price data from various possible structures
        let amount = 0;
        let currency = 'USD';
        let interval = 'month';

        if (latestSubscription.price) {
          const priceData = latestSubscription.price as any;
          amount = priceData.unit_amount
            ? priceData.unit_amount / 100
            : (priceData.amount ? priceData.amount / 100 : 0);
          currency = (priceData.currency || 'USD').toUpperCase();
          interval = priceData.recurring?.interval || 'month';
        }

        // Track successful subscription purchase in Firebase Analytics
        logSubscriptionPurchase(planName, amount, currency, interval, latestSubscription.id);

        // Track in Firestore database
        trackSubscriptionEvent(user.uid, 'subscribe', planName, amount).catch(error => {
          console.error('Failed to track subscription event in Firestore:', error);
        });

        // Clear URL params after a short delay
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
        }, 2000);
      } else {
        console.warn('[SubscriptionManagement] Cannot track purchase - no URL params or subscription data');
      }
    } else if (status === 'cancel') {
      // User cancelled subscription checkout
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [subscriptions, user]);

  const formatDate = (dateInput: any) => {
    try {
      if (!dateInput) {
        return 'N/A';
      }

      let date: Date;

      // Handle Firestore Timestamp objects with toDate method
      if (dateInput && typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      }
      // Handle Firestore Timestamp objects with seconds/nanoseconds
      else if (dateInput && typeof dateInput === 'object' && 'seconds' in dateInput) {
        date = new Date(dateInput.seconds * 1000);
      } else if (typeof dateInput === 'string') {
        // Handle GMT string format or ISO strings
        date = new Date(dateInput);
      } else if (typeof dateInput === 'number') {
        // Handle Unix timestamp (seconds or milliseconds)
        date = dateInput > 10000000000 ? new Date(dateInput) : new Date(dateInput * 1000);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        console.error('[formatDate] Unknown date format:', dateInput);
        return 'Invalid Date';
      }

      if (isNaN(date.getTime())) {
        console.error('[formatDate] Invalid date after conversion:', dateInput);
        return 'Invalid Date';
      }

      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return formatted;
    } catch (error) {
      console.error('[formatDate] Error formatting date:', error, dateInput);
      return 'Invalid Date';
    }
  };

  const formatPrice = (priceObj: any) => {
    try {
      if (!priceObj) {
        return 'N/A';
      }

      // Extract amount and currency from various possible structures
      let amount: number | undefined;
      let currency: string | undefined;

      // Check if priceObj has unit_amount directly
      if (typeof priceObj.unit_amount === 'number') {
        amount = priceObj.unit_amount;
        currency = priceObj.currency;
      }
      // Check if priceObj has amount field
      else if (typeof priceObj.amount === 'number') {
        amount = priceObj.amount;
        currency = priceObj.currency;
      }
      // Check if priceObj has unitAmount field
      else if (typeof priceObj.unitAmount === 'number') {
        amount = priceObj.unitAmount;
        currency = priceObj.currency;
      }

      if (!amount || !currency) {
        return 'N/A';
      }

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    } catch (error) {
      console.error('[formatPrice] Error formatting price:', error, priceObj);
      return 'N/A';
    }
  };

  if (subscriptionsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--ai-primary)]"></div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="p-6 border border-[color:var(--ai-card-border)]">
        <div className="text-center py-8">
          <FiAlertCircle className="mx-auto text-[color:var(--ai-muted)] mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
            {t('notLoggedIn')}
          </h3>
          <p className="text-[color:var(--ai-muted)] mb-4">{t('loginRequired')}</p>
        </div>
      </Card>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="p-6 border border-[color:var(--ai-card-border)]">
        <div className="text-center py-8">
          <FiCreditCard className="mx-auto text-[color:var(--ai-muted)] mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
            {t('noActiveSubscription')}
          </h3>
          <p className="text-[color:var(--ai-muted)] mb-6">{t('subscribeToUnlock')}</p>
          <Link href="/subscriptions">
            <Button color="primary" size="lg" endContent={<FiArrowRight />}>
              {t('viewPlans')}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription, index) => (
        <motion.div
          key={subscription.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6 border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[color:var(--ai-foreground)]">
                    {subscription.product?.name || 'Subscription'}
                  </h3>
                  {subscription.status === 'active' && (
                    <span className="bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FiCheck size={12} />
                      {t('status.active')}
                    </span>
                  )}
                  {subscription.status === 'trialing' && (
                    <span className="bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-3 py-1 rounded-full text-xs font-semibold">
                      {t('status.trial')}
                    </span>
                  )}
                  {subscription.status === 'past_due' && (
                    <span className="bg-[color:var(--ai-warning)]/10 text-[color:var(--ai-warning)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FiAlertCircle size={12} />
                      {t('status.pastDue')}
                    </span>
                  )}
                </div>
                {subscription.product?.description && (
                  <p className="text-sm text-[color:var(--ai-muted)]">
                    {subscription.product.description}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                  {formatPrice(subscription.price)}
                </div>
                {subscription.price?.recurring?.interval && (
                  <div className="text-sm text-[color:var(--ai-muted)]">
                    /{subscription.price.recurring.interval}
                  </div>
                )}
              </div>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--ai-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <FiClock className="text-[color:var(--ai-primary)]" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[color:var(--ai-foreground)] mb-1">
                    {t('currentPeriod')}
                  </p>
                  <p className="text-sm text-[color:var(--ai-muted)]">
                    {`${formatDate(subscription.current_period_start)} - ${formatDate(subscription.current_period_end)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--ai-secondary)]/10 flex items-center justify-center flex-shrink-0">
                  <FiCreditCard className="text-[color:var(--ai-secondary)]" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[color:var(--ai-foreground)] mb-1">
                    {t('nextBilling')}
                  </p>
                  <p className="text-sm text-[color:var(--ai-muted)]">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning for cancellation */}
            {subscription.cancel_at_period_end && (
              <div className="bg-[color:var(--ai-warning)]/10 border border-[color:var(--ai-warning)]/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-[color:var(--ai-warning)] flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-[color:var(--ai-foreground)] mb-1">
                      {t('subscriptionEnding')}
                    </p>
                    <p className="text-sm text-[color:var(--ai-muted)]">
                      {t('accessUntil', { date: formatDate(subscription.current_period_end) })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                color="primary"
                startContent={
                  creatingPortalLink === subscription.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <FiCreditCard />
                  )
                }
                isDisabled={creatingPortalLink === subscription.id}
                radius="lg"
                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none text-white font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={async () => {
                  setCreatingPortalLink(subscription.id);
                  try {
                    const payments = stripePayments(firebaseApp);
                    const portalLink = await createPortalLink(payments, {
                      returnUrl: window.location.href,
                    });
                    window.location.href = portalLink.url;
                  } catch (error) {
                    console.error('[SubscriptionManagement] Error creating portal link:', error);
                    console.error('[DEBUG] Error details:', JSON.stringify(error, null, 2));
                    setCreatingPortalLink(null);
                  }
                }}
              >
                {creatingPortalLink === subscription.id ? tCommon('loading') : t('manageSubscription')}
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Additional Info */}
      <Card className="p-6 bg-[color:var(--ai-primary)]/5 border border-[color:var(--ai-primary)]/20">
        <div className="flex items-start gap-3">
          <FiCheck className="text-[color:var(--ai-primary)] flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-[color:var(--ai-foreground)] mb-2">
              {t('benefits.title')}
            </h4>
            <ul className="space-y-2 text-sm text-[color:var(--ai-muted)]">
              <li>{t('benefits.allCourses')}</li>
              <li>{t('benefits.prioritySupport')}</li>
              <li>{t('benefits.exclusiveContent')}</li>
              <li>{t('benefits.cancelAnytime')}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
