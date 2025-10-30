'use client';

import React, { useState, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCheck, FiStar } from '@/components/icons/FeatherIcons';
import { AppContext } from '@/components/AppContext';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '@/components/Login';
import LoadingButton from '@/components/Buttons/LoadingButton';

// Stripe Price IDs from the created products
const PRICE_IDS = {
  monthly: 'price_1SNrO3LG0nGypmDBTVRqDU1A',
  yearly: 'price_1SNrO3LG0nGypmDBWezHzmWT',
};

export default function SubscriptionPlans() {
  const t = useTranslations('subscription');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!context) {
    throw new Error('SubscriptionPlans must be used within an AppContextProvider');
  }

  const { user, openModal, closeModal } = context;

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
        success_url: `${window.location.origin}/profile/settings?tab=subscription&status=success`,
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
      buttonVariant: 'bordered' as const,
      buttonColor: 'default' as const,
      popular: false,
      priceId: null,
      planKey: 'free',
    },
    {
      name: t('plans.proMonthly.name'),
      price: t('plans.proMonthly.price'),
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
      buttonVariant: 'solid' as const,
      buttonColor: 'primary' as const,
      popular: true,
      priceId: PRICE_IDS.monthly,
      planKey: 'monthly',
    },
    {
      name: t('plans.proYearly.name'),
      price: t('plans.proYearly.price'),
      period: t('plans.proYearly.period'),
      description: t('plans.proYearly.description'),
      savings: t('plans.proYearly.savings'),
      features: [
        t('plans.proYearly.features.everything'),
        t('plans.proYearly.features.twoMonthsFree'),
        t('plans.proYearly.features.prioritySupport'),
        t('plans.proYearly.features.exclusiveWorkshops'),
        t('plans.proYearly.features.earlyAccess'),
        t('plans.proYearly.features.careerResources'),
      ],
      buttonText: t('plans.proYearly.cta'),
      buttonVariant: 'solid' as const,
      buttonColor: 'secondary' as const,
      popular: false,
      priceId: PRICE_IDS.yearly,
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
              className={`p-8 h-full flex flex-col backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${plan.popular
                  ? 'border-2 border-[color:var(--ai-primary)] shadow-xl scale-105'
                  : 'border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50'
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
              ) : (
                <Button
                  color={plan.buttonColor}
                  variant={plan.buttonVariant}
                  size="lg"
                  className={`w-full font-semibold ${plan.popular
                      ? 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg hover:shadow-xl'
                      : ''
                    }`}
                  onClick={() => {
                    if (plan.priceId) {
                      handleSubscribe(plan.priceId, plan.planKey);
                    } else {
                      // For free plan, redirect to courses
                      window.location.href = '/courses';
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
