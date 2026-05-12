'use client';

import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCheck, FiStar, FiSettings, FiZap, FiBookOpen } from '@/components/icons/FeatherIcons';
import { AppContext } from '@/components/AppContext';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '@/components/Login';
import LoadingButton from '@/components/Buttons/LoadingButton';
import { useRouter } from 'next/navigation';
import { logSubscriptionView, logSubscriptionSelection } from '@/utils/analytics';

type Billing = 'monthly' | 'yearly';
type Tier = 'courses' | 'copilot';

interface AnyProduct {
  id: string;
  name?: string;
  metadata?: Record<string, string>;
  prices?: any[];
  active?: boolean;
}

function getProductTier(p: AnyProduct): Tier {
  const explicit = p.metadata?.tier;
  if (explicit === 'courses' || explicit === 'copilot') return explicit;
  // Backwards-compat: legacy "main plan" used to provision Copilot for everyone.
  if (p.metadata?.mainPlan === 'true') return 'copilot';
  return 'courses';
}

function pickPriceForInterval(product: AnyProduct | undefined, interval: 'month' | 'year') {
  if (!product?.prices) return null;
  const candidates = product.prices.filter((pr: any) => {
    if (pr.active === false) return false;
    const intv = pr.recurring?.interval || pr.metadata?.interval || pr.interval;
    return intv === interval;
  });
  if (candidates.length === 0) return null;
  // Prefer the price flagged as default by the admin.
  const defaultOne = candidates.find((pr: any) => pr.metadata?.default === 'true');
  if (defaultOne) return defaultOne;
  // Otherwise use the most-recently-created active price (deterministic).
  return candidates.slice().sort((a: any, b: any) => (b.created || 0) - (a.created || 0))[0];
}

function pickBestProduct(products: AnyProduct[], tier: Tier): AnyProduct | undefined {
  const sameTier = products.filter((p) => p.active !== false && getProductTier(p) === tier);
  if (sameTier.length === 0) return undefined;
  // Prefer mainPlan, then featured, then most-recent.
  return (
    sameTier.find((p) => p.metadata?.mainPlan === 'true') ||
    sameTier.find((p) => p.metadata?.featured === 'true') ||
    sameTier[0]
  );
}

export default function SubscriptionPlans() {
  const t = useTranslations('subscription');
  const context = useContext(AppContext);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billing, setBilling] = useState<Billing>('monthly');
  const router = useRouter();

  if (!context) {
    throw new Error('SubscriptionPlans must be used within an AppContextProvider');
  }

  const { user, openModal, closeModal, products, subscriptions } = context;

  useEffect(() => {
    logSubscriptionView('subscription_plans_page');
  }, []);

  const hasActiveSubscription = subscriptions && subscriptions.length > 0;

  const coursesProduct = useMemo(
    () => pickBestProduct((products as AnyProduct[]) || [], 'courses'),
    [products]
  );
  const copilotProduct = useMemo(
    () => pickBestProduct((products as AnyProduct[]) || [], 'copilot'),
    [products]
  );

  const interval: 'month' | 'year' = billing === 'monthly' ? 'month' : 'year';

  const coursesPrice = pickPriceForInterval(coursesProduct, interval);
  const copilotPrice = pickPriceForInterval(copilotProduct, interval);

  // Used for the "save X / year" hint
  const coursesMonthly = pickPriceForInterval(coursesProduct, 'month');
  const coursesYearly = pickPriceForInterval(coursesProduct, 'year');
  const copilotMonthly = pickPriceForInterval(copilotProduct, 'month');
  const copilotYearly = pickPriceForInterval(copilotProduct, 'year');

  const formatPrice = (price: any) => {
    if (!price || price.unit_amount == null) return null;
    const amountValue = price.unit_amount / 100;
    const currency = price.currency?.toUpperCase() || 'RON';
    const formatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amountValue);
    return { amount: amountValue, currency, formatted };
  };

  const yearlySavings = (monthly: any, yearly: any): string => {
    const m = formatPrice(monthly);
    const y = formatPrice(yearly);
    if (!m || !y) return '';
    const saved = m.amount * 12 - y.amount;
    if (saved <= 0) return '';
    const pct = ((saved / (m.amount * 12)) * 100).toFixed(0);
    return `${t('plans.proYearly.save')} ${saved.toFixed(0)} ${y.currency} (${pct}%)`;
  };

  const handleSubscribe = async (price: any, planKey: string) => {
    if (!price?.id) return;
    setLoadingPlan(planKey);
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
      const priceAmount = price.unit_amount / 100;
      const priceCurrency = price.currency?.toUpperCase() || 'RON';
      const priceInterval = price.recurring?.interval || interval;
      logSubscriptionSelection(planKey, priceAmount, priceInterval);

      // Auto-apply intro offer if the price has one (Stripe coupon wrapped in
      // a hidden promotion code created by the admin).
      const introPromoId: string | undefined = price.metadata?.intro_promotion_code;

      const payments = stripePayments(firebaseApp);
      const checkoutParams: any = {
        price: price.id,
        // Allow user-entered codes only when there is no auto-applied intro
        // (Stripe doesn't allow combining promotion_code with allow_promotion_codes).
        allow_promotion_codes: !introPromoId,
        mode: 'subscription',
        success_url: `${window.location.origin}/profile/subscriptions?status=success&plan=${planKey}&amount=${priceAmount}&currency=${priceCurrency}&interval=${priceInterval}`,
        cancel_url: `${window.location.origin}/subscriptions?status=cancel`,
      };
      if (introPromoId) checkoutParams.promotion_code = introPromoId;

      const session = await createCheckoutSession(payments, checkoutParams);
      window.location.assign(session.url);
    } catch (error) {
      console.error('Subscription error:', error);
      setLoadingPlan(null);
    }
  };

  type PlanCard = {
    key: string;
    name: string;
    description: string;
    price: string | null;
    period: string;
    icon: React.ReactNode;
    features: string[];
    buttonText: string;
    popular?: boolean;
    badge?: string;
    savings?: string;
    intro?: { formatted: string; months: number; regularFormatted: string } | null;
    accent: 'free' | 'courses' | 'copilot';
    onAction: () => void;
    disabled?: boolean;
  };

  const introFor = (price: any): PlanCard['intro'] => {
    if (!price?.metadata?.intro_amount || !price?.metadata?.intro_months) return null;
    const introCents = parseInt(price.metadata.intro_amount, 10);
    const months = parseInt(price.metadata.intro_months, 10) || 1;
    if (!Number.isFinite(introCents) || introCents <= 0) return null;
    const introFormatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: (price.currency || 'RON').toUpperCase(),
      minimumFractionDigits: introCents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(introCents / 100);
    const regular = formatPrice(price);
    return {
      formatted: introFormatted,
      months,
      regularFormatted: regular?.formatted || '',
    };
  };

  const cards: PlanCard[] = [
    {
      key: 'free',
      name: t('plans.free.name'),
      description: t('plans.free.description'),
      price: t('plans.free.price'),
      period: '',
      icon: <FiBookOpen size={20} />,
      features: [
        t('plans.free.features.access'),
        t('plans.free.features.basicSupport'),
        t('plans.free.features.communityAccess'),
        t('plans.free.features.limitedResources'),
        t('plans.free.features.certificates'),
      ],
      buttonText: t('plans.free.cta'),
      accent: 'free',
      onAction: () => router.push('/courses'),
    },
    {
      key: 'courses',
      name: t('plans.courses.name'),
      description: t('plans.courses.description'),
      price: formatPrice(coursesPrice)?.formatted ?? t('plans.unavailable'),
      period: interval === 'month' ? t('plans.proMonthly.period') : t('plans.proYearly.period'),
      icon: <FiBookOpen size={20} />,
      features: [
        t('plans.courses.features.allCourses'),
        t('plans.courses.features.allLessons'),
        t('plans.courses.features.certificates'),
        t('plans.courses.features.communityAccess'),
        t('plans.courses.features.cancelAnytime'),
      ],
      buttonText: t('plans.courses.cta'),
      savings: interval === 'year' ? yearlySavings(coursesMonthly, coursesYearly) : undefined,
      intro: introFor(coursesPrice),
      accent: 'courses',
      onAction: () => handleSubscribe(coursesPrice, `courses-${billing}`),
      disabled: !coursesPrice?.id,
    },
    {
      key: 'copilot',
      name: t('plans.copilot.name'),
      description: t('plans.copilot.description'),
      price: formatPrice(copilotPrice)?.formatted ?? t('plans.unavailable'),
      period: interval === 'month' ? t('plans.proMonthly.period') : t('plans.proYearly.period'),
      icon: <FiZap size={20} />,
      features: [
        t('plans.copilot.features.copilotAccount'),
        t('plans.copilot.features.unlimitedModels'),
        t('plans.copilot.features.allCourses'),
        t('plans.copilot.features.prioritySupport'),
        t('plans.copilot.features.exclusiveContent'),
        t('plans.copilot.features.cancelAnytime'),
      ],
      buttonText: t('plans.copilot.cta'),
      popular: true,
      badge: interval === 'year' ? t('plans.proYearly.badge') : undefined,
      savings: interval === 'year' ? yearlySavings(copilotMonthly, copilotYearly) : undefined,
      intro: introFor(copilotPrice),
      accent: 'copilot',
      onAction: () => handleSubscribe(copilotPrice, `copilot-${billing}`),
      disabled: !copilotPrice?.id,
    },
  ];

  return (
    <div className="relative">
      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1 rounded-full border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm">
          {(['monthly', 'yearly'] as Billing[]).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`px-5 h-9 rounded-full text-sm font-medium transition-all ${
                billing === b
                  ? 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-md'
                  : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
              }`}
            >
              {b === 'monthly' ? t('billing.monthly') : t('billing.yearly')}
              {b === 'yearly' && (
                <span className="ml-2 text-[10px] uppercase tracking-wide opacity-90">
                  {t('billing.savePill')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {cards.map((plan, index) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
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
              className={`p-8 h-full flex flex-col rounded-xl bg-[color:var(--ai-card-bg)] backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? 'border-2 border-[color:var(--ai-primary)] shadow-xl md:scale-105'
                  : 'border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 shadow-lg'
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${
                      plan.accent === 'copilot'
                        ? 'bg-violet-500/15 text-violet-500 dark:text-violet-300'
                        : plan.accent === 'courses'
                          ? 'bg-sky-500/15 text-sky-500 dark:text-sky-300'
                          : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-muted)]'
                    }`}
                  >
                    {plan.icon}
                  </span>
                  <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)]">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-sm text-[color:var(--ai-muted)]">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.intro ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold uppercase tracking-wide">
                      🎁 {t('plans.introBadge', { months: plan.intro.months })}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-emerald-500">
                        {plan.intro.formatted}
                      </span>
                      {plan.period && (
                        <span className="text-[color:var(--ai-muted)]">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-xs text-[color:var(--ai-muted)] mt-1">
                      {t('plans.introThen', {
                        months: plan.intro.months,
                        price: plan.intro.regularFormatted,
                        period: plan.period,
                      })}
                    </p>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[color:var(--ai-foreground)]">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[color:var(--ai-muted)]">/{plan.period}</span>
                    )}
                  </div>
                )}
                {plan.savings && (
                  <p className="text-sm text-[color:var(--ai-success)] font-medium mt-1">
                    {plan.savings}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular
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

              {loadingPlan === plan.key ||
              (loadingPlan === `courses-${billing}` && plan.key === 'courses') ||
              (loadingPlan === `copilot-${billing}` && plan.key === 'copilot') ? (
                <LoadingButton className="w-full" size="lg" loadingText={t('toast.processing')} />
              ) : hasActiveSubscription && plan.key !== 'free' ? (
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
                  isDisabled={plan.disabled}
                  className={`w-full font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none text-white'
                      : plan.key === 'free'
                        ? 'border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground)] bg-transparent'
                        : 'bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] border-none text-white'
                  }`}
                  onClick={plan.onAction}
                >
                  {plan.disabled ? t('plans.unavailable') : plan.buttonText}
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
