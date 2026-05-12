import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SubscriptionPlans from '@/components/Subscriptions/SubscriptionPlans';
import SubscriptionBenefits from '@/components/Subscriptions/SubscriptionBenefits';
import SubscriptionFAQ from '@/components/Subscriptions/SubscriptionFAQ';
import CopilotPerksCard from '@/components/shared/CopilotPerksCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('subscription');

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default async function SubscriptionsPage() {
  const t = await getTranslations('subscription');

  return (
    <div className="min-h-screen bg-[color:var(--ai-background)]">
      {/* Editorial hero */}
      <div className="relative">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-500 mb-4">
              StudiAI · Abonamente
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6 text-[color:var(--ai-foreground)]">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--ai-muted)] leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Copilot hero card - the headline benefit */}
      <div className="container mx-auto px-4 -mt-8 md:-mt-12 mb-12 md:mb-16 relative z-10">
        <CopilotPerksCard variant="hero" />
      </div>

      {/* Pricing Plans */}
      <div className="container mx-auto px-4 pb-16">
        <SubscriptionPlans />
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 pb-16">
        <SubscriptionBenefits />
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-24">
        <SubscriptionFAQ />
      </div>
    </div>
  );
}
