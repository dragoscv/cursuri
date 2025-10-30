'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiAward,
} from '@/components/icons/FeatherIcons';

export default function SubscriptionBenefits() {
  const t = useTranslations('subscription.benefits');

  const benefits = [
    {
      icon: FiBook,
      title: t('comprehensive.title'),
      description: t('comprehensive.description'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiUsers,
      title: t('community.title'),
      description: t('community.description'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiTrendingUp,
      title: t('careerGrowth.title'),
      description: t('careerGrowth.description'),
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiAward,
      title: t('certification.title'),
      description: t('certification.description'),
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[color:var(--ai-foreground)]">
          {t('title')}
        </h2>
        <p className="text-lg text-[color:var(--ai-muted)] max-w-2xl mx-auto">
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
              <Card className="p-6 h-full backdrop-blur-sm border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 transition-all duration-300 hover:shadow-xl group">
                <div className="mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[color:var(--ai-foreground)]">
                  {benefit.title}
                </h3>
                <p className="text-[color:var(--ai-muted)] leading-relaxed">
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
