'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import { FiBook, FiUsers, FiTrendingUp, FiAward } from '@/components/icons/FeatherIcons';

export default function SubscriptionBenefits() {
  const t = useTranslations('subscription.benefits');

  const benefits = [
    {
      icon: FiBook,
      title: t('comprehensive.title'),
      description: t('comprehensive.description'),
    },
    {
      icon: FiUsers,
      title: t('community.title'),
      description: t('community.description'),
    },
    {
      icon: FiTrendingUp,
      title: t('careerGrowth.title'),
      description: t('careerGrowth.description'),
    },
    {
      icon: FiAward,
      title: t('certification.title'),
      description: t('certification.description'),
    },
  ];

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="text-center mb-12">
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-500 mb-3">
          De ce StudiAI Pro
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4 text-[color:var(--ai-foreground)]">
          {t('title')}
        </h2>
        <p className="text-lg text-[color:var(--ai-muted)] max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-amber-500/40 transition-colors duration-200 shadow-none">
                <div className="mb-4">
                  <div className="w-11 h-11 rounded-xl border border-amber-500/40 bg-amber-500/[0.06] flex items-center justify-center">
                    <Icon className="text-amber-500" size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] mb-2 text-[color:var(--ai-foreground)]">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
