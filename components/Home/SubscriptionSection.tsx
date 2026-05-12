'use client';

import React, { useState, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { FiCheck, FiArrowRight, FiSettings } from '@/components/icons/FeatherIcons';
import { AppContext } from '@/components/AppContext';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '@/components/Login';
import LoadingButton from '@/components/Buttons/LoadingButton';
import SectionHeading from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/motion';
import { useRouter } from 'next/navigation';
import CopilotPerksCard from '@/components/shared/CopilotPerksCard';

export default function SubscriptionSection() {
  const t = useTranslations('subscription');
  const context = useContext(AppContext);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  if (!context) {
    throw new Error('SubscriptionSection must be used within an AppContextProvider');
  }

  const { user, openModal, closeModal, products, subscriptions } = context;

  const hasActiveSubscription = subscriptions && subscriptions.length > 0;

  const subscriptionProduct = products?.find(
    (p: any) =>
      p.metadata?.type === 'subscription' || p.name?.toLowerCase().includes('subscription')
  );

  const monthlyPrice = subscriptionProduct?.prices?.find((p: any) => {
    const isActive = p.active !== false;
    const isMonthly =
      p.metadata?.interval === 'month' ||
      p.recurring?.interval === 'month' ||
      p.interval === 'month';
    return isActive && isMonthly;
  });

  const yearlyPrice = subscriptionProduct?.prices?.find((p: any) => {
    const isActive = p.active !== false;
    const isYearly =
      p.metadata?.interval === 'year' || p.recurring?.interval === 'year' || p.interval === 'year';
    return isActive && isYearly;
  });

  const formatPrice = (price: any) => {
    if (!price || !price.unit_amount) return null;
    const amountValue = price.unit_amount / 100;
    const currency = price.currency?.toUpperCase() || 'USD';
    const formatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amountValue);
    return { amount: amountValue, currency, formatted };
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
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
    <section className="relative w-full py-24 md:py-32 bg-[color:var(--ai-background)]">
      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <Reveal trigger="view" offset={28}>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            className="mb-14"
          />
        </Reveal>

        <div className="max-w-5xl mx-auto mb-12">
          <CopilotPerksCard variant="banner" ctaHref="/subscriptions" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Monthly Plan — recommended (gold rail) */}
          <PlanCard
            recommended
            name={t('plans.proMonthly.name')}
            description={t('plans.proMonthly.description')}
            priceLabel={monthlyPriceInfo ? monthlyPriceInfo.formatted : t('plans.proMonthly.price')}
            period={t('plans.proMonthly.period')}
            badgeLabel={t('plans.popular')}
            features={[
              t('plans.proMonthly.features.unlimitedAccess'),
              t('plans.proMonthly.features.allCourses'),
              t('plans.proMonthly.features.prioritySupport'),
              t('plans.proMonthly.features.exclusiveContent'),
            ]}
            ctaLabel={t('plans.proMonthly.cta')}
            manageLabel={t('manage.manageSubscription')}
            processingLabel={t('toast.processing')}
            loading={loadingPlan === 'monthly'}
            hasActiveSubscription={!!hasActiveSubscription}
            disabled={!monthlyPrice?.id}
            onSubscribe={() => monthlyPrice?.id && handleSubscribe(monthlyPrice.id, 'monthly')}
            onManage={() => router.push('/profile/subscriptions')}
            delay={0.1}
          />

          {/* Yearly Plan — calm card with savings note */}
          <PlanCard
            name={t('plans.proYearly.name')}
            description={t('plans.proYearly.description')}
            priceLabel={yearlyPriceInfo ? yearlyPriceInfo.formatted : t('plans.proYearly.price')}
            period={t('plans.proYearly.period')}
            badgeLabel={t('plans.proYearly.badge')}
            savingsLabel={t('plans.proYearly.savings')}
            features={[
              t('plans.proYearly.features.everything'),
              t('plans.proYearly.features.twoMonthsFree'),
              t('plans.proYearly.features.prioritySupport'),
              t('plans.proYearly.features.exclusiveWorkshops'),
            ]}
            ctaLabel={t('plans.proYearly.cta')}
            manageLabel={t('manage.manageSubscription')}
            processingLabel={t('toast.processing')}
            loading={loadingPlan === 'yearly'}
            hasActiveSubscription={!!hasActiveSubscription}
            disabled={!yearlyPrice?.id}
            onSubscribe={() => yearlyPrice?.id && handleSubscribe(yearlyPrice.id, 'yearly')}
            onManage={() => router.push('/profile/subscriptions')}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

interface PlanCardProps {
  recommended?: boolean;
  name: string;
  description: string;
  priceLabel: string;
  period: string;
  badgeLabel: string;
  savingsLabel?: string;
  features: string[];
  ctaLabel: string;
  manageLabel: string;
  processingLabel: string;
  loading: boolean;
  hasActiveSubscription: boolean;
  disabled: boolean;
  onSubscribe: () => void;
  onManage: () => void;
  delay: number;
}

function PlanCard({
  recommended = false,
  name,
  description,
  priceLabel,
  period,
  badgeLabel,
  savingsLabel,
  features,
  ctaLabel,
  manageLabel,
  processingLabel,
  loading,
  hasActiveSubscription,
  disabled,
  onSubscribe,
  onManage,
  delay,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      <div
        className={`relative h-full flex flex-col rounded-2xl border bg-[color:var(--ai-card-bg)] p-7 transition-colors duration-200 ${
          recommended
            ? 'border-[color:var(--ai-card-border)]'
            : 'border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-foreground)]/40'
        }`}
      >
        {/* Recommended: gold left rail */}
        {recommended && (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-gradient-to-b from-amber-400 to-amber-500"
          />
        )}

        {/* Eyebrow badge */}
        <span
          className={`inline-flex w-fit items-center text-[10px] uppercase tracking-[0.18em] font-semibold mb-4 ${
            recommended
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent'
              : 'text-[color:var(--ai-muted)]'
          }`}
        >
          {badgeLabel}
        </span>

        {/* Plan name + description */}
        <h3 className="text-xl md:text-2xl font-semibold tracking-[-0.01em] text-[color:var(--ai-foreground)]">
          {name}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--ai-muted)]">
          {description}
        </p>

        {/* Price */}
        <div className="mt-6 flex items-baseline gap-1.5">
          <span className="text-4xl font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--ai-foreground)]">
            {priceLabel}
          </span>
          <span className="text-sm text-[color:var(--ai-muted)]">/{period}</span>
        </div>
        {savingsLabel && (
          <p className="mt-1.5 text-xs font-medium text-emerald-500">{savingsLabel}</p>
        )}

        {/* Features */}
        <ul className="mt-6 mb-8 space-y-2.5 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <FiCheck
                size={15}
                className="mt-0.5 flex-shrink-0 text-amber-500"
                aria-hidden="true"
              />
              <span className="text-[13px] leading-relaxed text-[color:var(--ai-muted)]">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {loading ? (
          <LoadingButton className="w-full" size="lg" loadingText={processingLabel} />
        ) : hasActiveSubscription ? (
          <button
            type="button"
            onClick={onManage}
            className="cursor-pointer inline-flex items-center justify-center gap-2 w-full h-11 rounded-full text-sm font-medium border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-foreground)] text-[color:var(--ai-foreground)] transition-colors duration-200"
          >
            <FiSettings size={15} aria-hidden="true" />
            {manageLabel}
          </button>
        ) : recommended ? (
          <button
            type="button"
            onClick={onSubscribe}
            disabled={disabled}
            className="cursor-pointer inline-flex items-center justify-center gap-2 w-full h-11 rounded-full text-sm font-medium bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
          >
            {ctaLabel}
            <FiArrowRight size={15} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubscribe}
            disabled={disabled}
            className="cursor-pointer inline-flex items-center justify-center gap-2 w-full h-11 rounded-full text-sm font-medium border border-[color:var(--ai-foreground)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)] hover:text-[color:var(--ai-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {ctaLabel}
            <FiArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
