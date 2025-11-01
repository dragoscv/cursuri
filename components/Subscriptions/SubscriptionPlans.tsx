'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCheck, FiStar, FiSettings } from '@/components/icons/FeatherIcons';
import { AppContext } from '@/components/AppContext';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '@/components/Login';
import LoadingButton from '@/components/Buttons/LoadingButton';
import { useRouter } from 'next/navigation';
import { logSubscriptionView, logSubscriptionSelection, logSubscriptionPurchase } from '@/utils/analytics';
import { trackSubscriptionEvent, trackRevenue } from '@/utils/statistics';

export default function SubscriptionPlans() {
  const t = useTranslations('subscription');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  if (!context) {
    throw new Error('SubscriptionPlans must be used within an AppContextProvider');
  }

  const { user, openModal, closeModal, products, subscriptions, subscriptionsLoading } = context;

  // Track subscription page view
  useEffect(() => {
    logSubscriptionView('subscription_plans_page');
  }, []);

  // Check if user has an active subscription
  const hasActiveSubscription = subscriptions && subscriptions.length > 0;

  // Find subscription product from products
  const subscriptionProduct = products?.find((p: any) =>
    p.metadata?.type === 'subscription' || p.name?.toLowerCase().includes('subscription')
  );

  // Get app name for filtering
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'cursuri';

  // Get monthly and yearly prices from the subscription product
  // Since the product already has the correct metadata, just filter by active status and interval
  const monthlyPrice = subscriptionProduct?.prices?.find((p: any) => {
    const isActive = p.active !== false;
    const isMonthly = p.metadata?.interval === 'month' || p.recurring?.interval === 'month' || p.interval === 'month';

    return isActive && isMonthly;
  });

  const yearlyPrice = subscriptionProduct?.prices?.find((p: any) => {
    const isActive = p.active !== false;
    const isYearly = p.metadata?.interval === 'year' || p.recurring?.interval === 'year' || p.interval === 'year';

    return isActive && isYearly;
  });

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

    // If currency is RON, show approximate USD conversion
    let approximateUSD = '';
    if (currency === 'RON') {
      const usdAmount = amountValue / 4.5; // Approximate conversion rate
      approximateUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: usdAmount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    }

    return {
      amount: amountValue,
      currency,
      formatted,
      approximateUSD,
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
      // Find the price details for analytics
      let priceAmount = 0;
      let priceCurrency = 'USD';
      let priceInterval = 'month';

      if (planName === 'monthly' && monthlyPrice) {
        priceAmount = monthlyPrice.unit_amount / 100;
        priceCurrency = monthlyPrice.currency?.toUpperCase() || 'USD';
        priceInterval = monthlyPrice.recurring?.interval || 'month';
      } else if (planName === 'yearly' && yearlyPrice) {
        priceAmount = yearlyPrice.unit_amount / 100;
        priceCurrency = yearlyPrice.currency?.toUpperCase() || 'USD';
        priceInterval = yearlyPrice.recurring?.interval || 'year';
      }

      // Track subscription selection
      logSubscriptionSelection(
        planName,
        priceAmount,
        priceInterval
      );

      const payments = stripePayments(firebaseApp);
      const session = await createCheckoutSession(payments, {
        price: priceId,
        allow_promotion_codes: true,
        mode: 'subscription',
        success_url: `${window.location.origin}/profile/subscriptions?status=success&plan=${planName}&amount=${priceAmount}&currency=${priceCurrency}&interval=${priceInterval}`,
        cancel_url: `${window.location.origin}/subscriptions?status=cancel`,
      });

      window.location.assign(session.url);
    } catch (error) {
      console.error('Subscription error:', error);
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: t('plans.free.name'),
      price: t('plans.free.price'),
      period: '',
      description: t('plans.free.description'),
      features: [
        t('plans.free.features.access'),
        t('plans.free.features.basicSupport'),
        t('plans.free.features.communityAccess'),
        t('plans.free.features.limitedResources'),
        t('plans.free.features.certificates'),
      ],
      buttonText: t('plans.free.cta'),
      popular: false,
      priceId: null,
      planKey: 'free',
    },
    {
      name: t('plans.proMonthly.name'),
      price: (() => {
        const priceInfo = formatPrice(monthlyPrice);
        return priceInfo ? priceInfo.formatted : 'Error: Price not found';
      })(),
      approximateUSD: (() => {
        const priceInfo = formatPrice(monthlyPrice);
        return priceInfo?.approximateUSD || '';
      })(),
      period: t('plans.proMonthly.period'),
      description: t('plans.proMonthly.description'),
      features: [
        t('plans.proMonthly.features.unlimitedAccess'),
        t('plans.proMonthly.features.allCourses'),
        t('plans.proMonthly.features.prioritySupport'),
        t('plans.proMonthly.features.exclusiveContent'),
        t('plans.proMonthly.features.advancedFeatures'),
        t('plans.proMonthly.features.certificates'),
        t('plans.proMonthly.features.cancelAnytime'),
      ],
      buttonText: t('plans.proMonthly.cta'),
      popular: true,
      priceId: monthlyPrice?.id || null,
      planKey: 'monthly',
    },
    {
      name: t('plans.proYearly.name'),
      price: (() => {
        const priceInfo = formatPrice(yearlyPrice);
        return priceInfo ? priceInfo.formatted : 'Error: Price not found';
      })(),
      approximateUSD: (() => {
        const priceInfo = formatPrice(yearlyPrice);
        return priceInfo?.approximateUSD || '';
      })(),
      period: t('plans.proYearly.period'),
      description: t('plans.proYearly.description'),
      savings: (() => {
        const monthlyPriceInfo = formatPrice(monthlyPrice);
        const yearlyPriceInfo = formatPrice(yearlyPrice);
        if (monthlyPriceInfo && yearlyPriceInfo) {
          const monthlyCost = monthlyPriceInfo.amount * 12;
          const yearlyCost = yearlyPriceInfo.amount;
          const savings = monthlyCost - yearlyCost;
          const percentage = ((savings / monthlyCost) * 100).toFixed(0);
          return `${t('plans.proYearly.save')} ${savings.toFixed(2)} ${yearlyPriceInfo.currency} (${percentage}%)`;
        }
        return '';
      })(),
      features: [
        t('plans.proYearly.features.everything'),
        t('plans.proYearly.features.twoMonthsFree'),
        t('plans.proYearly.features.prioritySupport'),
        t('plans.proYearly.features.exclusiveWorkshops'),
        t('plans.proYearly.features.earlyAccess'),
        t('plans.proYearly.features.careerResources'),
      ],
      buttonText: t('plans.proYearly.cta'),
      popular: false,
      priceId: yearlyPrice?.id || null,
      planKey: 'yearly',
      badge: t('plans.proYearly.badge'),
    },
  ];

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.planKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                  <FiStar size={14} />
                  {t('plans.popular')}
                </div>
              </div>
            )}

            {plan.badge && (
              <div className="absolute -top-4 right-4 z-10">
                <div className="bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {plan.badge}
                </div>
              </div>
            )}

            <Card
              className={`p-8 h-full flex flex-col rounded-xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${plan.popular
                ? 'border-2 border-[color:var(--ai-primary)] shadow-xl scale-105'
                : 'border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 shadow-lg'
                }`}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-[color:var(--ai-muted)]">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[color:var(--ai-muted)]">/{plan.period}</span>
                  )}
                </div>
                {plan.approximateUSD && (
                  <p className="text-xs text-[color:var(--ai-muted)] mt-1">
                    ≈ {plan.approximateUSD}
                  </p>
                )}
                {plan.savings && (
                  <p className="text-sm text-[color:var(--ai-success)] font-medium mt-1">
                    {plan.savings}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular
                        ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                        : 'bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)]'
                        }`}
                    >
                      <FiCheck size={14} />
                    </div>
                    <span className="text-sm text-[color:var(--ai-muted)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {loadingPlan === plan.planKey ? (
                <LoadingButton
                  className="w-full"
                  size="lg"
                  loadingText={t('toast.processing')}
                />
              ) : hasActiveSubscription && plan.priceId ? (
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
                  className={`w-full font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${plan.popular
                    ? 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none text-white'
                    : plan.planKey === 'free'
                      ? 'border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground)] bg-transparent'
                      : 'bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] border-none text-white'
                    }`}
                  onClick={() => {
                    if (plan.priceId) {
                      handleSubscribe(plan.priceId, plan.planKey);
                    } else {
                      // For free plan, redirect to courses
                      router.push('/courses');
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
