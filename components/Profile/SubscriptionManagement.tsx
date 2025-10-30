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
import { getCurrentUserSubscriptions } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Link from 'next/link';

// Using any type for Subscription since firewand types may vary
type Subscription = any;

export default function SubscriptionManagement() {
  const t = useTranslations('subscription.manage');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  if (!context) {
    throw new Error('SubscriptionManagement must be used within AppContextProvider');
  }

  const { user } = context;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const payments = stripePayments(firebaseApp);
        const subs = await getCurrentUserSubscriptions(payments, {
          status: ['active', 'trialing', 'past_due'],
        });
        setSubscriptions(subs as Subscription[]);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const formatDate = (timestamp: string | number) => {
    const date = typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
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

  if (subscriptions.length === 0) {
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
                    {subscription.product.name}
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
                {subscription.product.description && (
                  <p className="text-sm text-[color:var(--ai-muted)]">
                    {subscription.product.description}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                  {formatPrice(subscription.price.unit_amount, subscription.price.currency)}
                </div>
                <div className="text-sm text-[color:var(--ai-muted)]">
                  /{subscription.price.recurring.interval}
                </div>
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
                    {formatDate(subscription.current_period_start)} -{' '}
                    {formatDate(subscription.current_period_end)}
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
                    {subscription.cancel_at_period_end
                      ? t('cancelAtPeriodEnd')
                      : formatDate(subscription.current_period_end)}
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
                variant="bordered"
                color="default"
                size="md"
                onClick={() => {
                  // Navigate to Stripe customer portal
                  window.location.href = '/api/stripe/create-portal-session';
                }}
              >
                {t('manageSubscription')}
              </Button>

              <Link href="/subscriptions">
                <Button variant="flat" color="primary" size="md">
                  {t('upgradePlan')}
                </Button>
              </Link>
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
