import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SubscriptionPlans from '@/components/Subscriptions/SubscriptionPlans';
import SubscriptionBenefits from '@/components/Subscriptions/SubscriptionBenefits';
import SubscriptionFAQ from '@/components/Subscriptions/SubscriptionFAQ';

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
    <div className="min-h-screen bg-gradient-to-br from-[color:var(--ai-background)] via-[color:var(--ai-card-bg)]/50 to-[color:var(--ai-background)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 animate-gradient-xy"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[color:var(--ai-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[color:var(--ai-secondary)]/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--ai-muted)] mb-8">
              {t('subtitle')}
            </p>
          </div>
        </div>
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
