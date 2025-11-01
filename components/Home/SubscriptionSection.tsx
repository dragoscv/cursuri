'use client';

import React, { useState, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCheck, FiArrowRight, FiStar, FiSettings } from '@/components/icons/FeatherIcons';
import { AppContext } from '@/components/AppContext';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '@/components/Login';
import LoadingButton from '@/components/Buttons/LoadingButton';
import { useRouter } from 'next/navigation';

export default function SubscriptionSection() {
  const t = useTranslations('subscription');
  const context = useContext(AppContext);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  if (!context) {
    throw new Error('SubscriptionSection must be used within an AppContextProvider');
  }

  const { user, openModal, closeModal, products, subscriptions } = context;

  // Check if user has an active subscription
  const hasActiveSubscription = subscriptions && subscriptions.length > 0;

  // Debug: Log products structure
  console.log('=== SubscriptionSection DEBUG ===', {
    productsCount: products?.length,
    products: products?.map((p: any) => ({
      id: p.id,
      name: p.name,
      metadata: p.metadata,
      pricesCount: p.prices?.length,
    }))
  });

  // Find subscription product from products
  const subscriptionProduct = products?.find((p: any) =>
    p.metadata?.type === 'subscription' || p.name?.toLowerCase().includes('subscription')
  );

  console.log('Found subscription product:', subscriptionProduct);

  // Get app name for filtering
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'cursuri';

  // Get monthly and yearly prices from the subscription product
  // Filter by metadata fields and ensure it's for the current app
  const monthlyPrice = subscriptionProduct?.prices?.find((p: any) => {
    console.log('SubscriptionSection - Checking monthly price:', {
      priceId: p.id,
      active: p.active,
      metadata: p.metadata,
      recurring: p.recurring,
      interval: p.interval,
    });
    
    return p.active !== false &&
      p.metadata?.type === 'subscription' &&
      p.metadata?.app === appName &&
      (p.metadata?.interval === 'month' || p.recurring?.interval === 'month');
  });

  const yearlyPrice = subscriptionProduct?.prices?.find((p: any) => {
    console.log('SubscriptionSection - Checking yearly price:', {
      priceId: p.id,
      active: p.active,
      metadata: p.metadata,
      recurring: p.recurring,
      interval: p.interval,
    });
    
    return p.active !== false &&
      p.metadata?.type === 'subscription' &&
      p.metadata?.app === appName &&
      (p.metadata?.interval === 'year' || p.recurring?.interval === 'year');
  });

  console.log('Found prices:', { monthlyPrice, yearlyPrice, appName });

  // Helper function to format price
  const formatPrice = (price: any) => {
    if (!price || !price.unit_amount) return null;

    const amountValue = price.unit_amount / 100;
    const currency = price.currency?.toUpperCase() || 'USD';

    // Format price using Intl.NumberFormat for proper locale formatting
    const formatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amountValue);

    return {
      amount: amountValue,
      currency,
      formatted,
    };
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);

    // Check if user is logged in
    if (!user) {
      setLoadingPlan(null);
      openModal({
        id: 'login-modal',
        isOpen: true,
        modalHeader: t('toast.loginRequired'),
        modalBody: <Login onClose={() => closeModal('login-modal')} />,
        onClose: () => closeModal('login-modal'),
      });
      return;
    }

    try {
      const payments = stripePayments(firebaseApp);
      const session = await createCheckoutSession(payments, {
        price: priceId,
        allow_promotion_codes: true,
        mode: 'subscription',
        success_url: `${window.location.origin}/profile/subscriptions?status=success`,
        cancel_url: `${window.location.origin}/?status=cancel`,
      });
      window.location.assign(session.url);
    } catch (error) {
      console.error('Subscription error:', error);
      setLoadingPlan(null);
    }
  };

  const monthlyPriceInfo = formatPrice(monthlyPrice);
  const yearlyPriceInfo = formatPrice(yearlyPrice);

  return (
    <section className="relative w-full py-20 overflow-hidden bg-gradient-to-br from-[color:var(--ai-background)] via-[color:var(--ai-card-bg)]/30 to-[color:var(--ai-background)]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[color:var(--ai-primary)]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[color:var(--ai-secondary)]/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-lg text-[color:var(--ai-muted)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                <FiStar size={14} />
                {t('plans.popular')}
              </div>
            </div>

            <Card className="p-8 h-full flex flex-col rounded-xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] backdrop-blur-sm transition-all duration-300 hover:shadow-2xl border-2 border-[color:var(--ai-primary)] shadow-xl scale-105">
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                  {t('plans.proMonthly.name')}
                </h3>
                <p className="text-sm text-[color:var(--ai-muted)]">{t('plans.proMonthly.description')}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                    {monthlyPriceInfo ? monthlyPriceInfo.formatted : t('plans.proMonthly.price')}
                  </span>
                  <span className="text-[color:var(--ai-muted)]">/{t('plans.proMonthly.period')}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  t('plans.proMonthly.features.unlimitedAccess'),
                  t('plans.proMonthly.features.allCourses'),
                  t('plans.proMonthly.features.prioritySupport'),
                  t('plans.proMonthly.features.exclusiveContent'),
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck size={14} />
                    </div>
                    <span className="text-sm text-[color:var(--ai-muted)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {loadingPlan === 'monthly' ? (
                <LoadingButton
                  className="w-full"
                  size="lg"
                  loadingText={t('toast.processing')}
                />
              ) : hasActiveSubscription ? (
                // Show "Manage Subscription" button if user already has a subscription
                <Button
                  size="lg"
                  radius="lg"
                  className="w-full font-medium border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)] px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-[color:var(--ai-foreground)]"
                  startContent={<FiSettings />}
                  onClick={() => router.push('/profile/subscriptions')}
                >
                  {t('manage.manageSubscription')}
                </Button>
              ) : (
                <Button
                  size="lg"
                  radius="lg"
                  className="w-full font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none text-white"
                  endContent={<FiArrowRight />}
                  onClick={() => {
                    if (monthlyPrice?.id) {
                      handleSubscribe(monthlyPrice.id, 'monthly');
                    }
                  }}
                  disabled={!monthlyPrice?.id}
                >
                  {t('plans.proMonthly.cta')}
                </Button>
              )}
            </Card>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-4 right-4 z-10">
              <div className="bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                {t('plans.proYearly.badge')}
              </div>
            </div>

            <Card className="p-8 h-full flex flex-col rounded-xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] backdrop-blur-sm transition-all duration-300 hover:shadow-2xl border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 shadow-lg">
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                  {t('plans.proYearly.name')}
                </h3>
                <p className="text-sm text-[color:var(--ai-muted)]">{t('plans.proYearly.description')}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                    {yearlyPriceInfo ? yearlyPriceInfo.formatted : t('plans.proYearly.price')}
                  </span>
                  <span className="text-[color:var(--ai-muted)]">/{t('plans.proYearly.period')}</span>
                </div>
                <p className="text-sm text-[color:var(--ai-success)] font-medium mt-1">
                  {t('plans.proYearly.savings')}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  t('plans.proYearly.features.everything'),
                  t('plans.proYearly.features.twoMonthsFree'),
                  t('plans.proYearly.features.prioritySupport'),
                  t('plans.proYearly.features.exclusiveWorkshops'),
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck size={14} />
                    </div>
                    <span className="text-sm text-[color:var(--ai-muted)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {loadingPlan === 'yearly' ? (
                <LoadingButton
                  className="w-full"
                  size="lg"
                  loadingText={t('toast.processing')}
                />
              ) : hasActiveSubscription ? (
                // Show "Manage Subscription" button if user already has a subscription
                <Button
                  size="lg"
                  radius="lg"
                  className="w-full font-medium border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)] px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-[color:var(--ai-foreground)]"
                  startContent={<FiSettings />}
                  onClick={() => router.push('/profile/subscriptions')}
                >
                  {t('manage.manageSubscription')}
                </Button>
              ) : (
                <Button
                  size="lg"
                  radius="lg"
                  className="w-full font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] border-none text-white"
                  endContent={<FiArrowRight />}
                  onClick={() => {
                    if (yearlyPrice?.id) {
                      handleSubscribe(yearlyPrice.id, 'yearly');
                    }
                  }}
                  disabled={!yearlyPrice?.id}
                >
                  {t('plans.proYearly.cta')}
                </Button>
              )}
            </Card>
          </motion.div>
        </div>


      </div>
    </section>
  );
}
