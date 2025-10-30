'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCheck, FiArrowRight, FiStar } from '@/components/icons/FeatherIcons';
import Link from 'next/link';

export default function SubscriptionSection() {
  const t = useTranslations('subscription');

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
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-8 h-full backdrop-blur-sm border-2 border-[color:var(--ai-primary)] shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              {/* Popular badge */}
              <div className="absolute -top-3 -right-3">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg rotate-12">
                  <FiStar size={14} />
                  {t('plans.popular')}
                </div>
              </div>

              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                  {t('plans.proMonthly.name')}
                </h3>
                <p className="text-sm text-[color:var(--ai-muted)] mb-6">
                  {t('plans.proMonthly.description')}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                      {t('plans.proMonthly.price')}
                    </span>
                    <span className="text-[color:var(--ai-muted)]">/{t('plans.proMonthly.period')}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
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

                <Link href="/subscriptions">
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg hover:shadow-xl font-semibold"
                    endContent={<FiArrowRight />}
                  >
                    {t('plans.proMonthly.cta')}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 h-full backdrop-blur-sm border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-secondary)]/50 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              {/* Best value badge */}
              <div className="absolute -top-3 right-4">
                <div className="bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {t('plans.proYearly.badge')}
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                  {t('plans.proYearly.name')}
                </h3>
                <p className="text-sm text-[color:var(--ai-muted)] mb-6">
                  {t('plans.proYearly.description')}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] bg-clip-text text-transparent">
                      {t('plans.proYearly.price')}
                    </span>
                    <span className="text-[color:var(--ai-muted)]">/{t('plans.proYearly.period')}</span>
                  </div>
                  <p className="text-sm text-[color:var(--ai-success)] font-medium mt-1">
                    {t('plans.proYearly.savings')}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
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

                <Link href="/subscriptions">
                  <Button
                    color="secondary"
                    size="lg"
                    variant="bordered"
                    className="w-full font-semibold hover:bg-[color:var(--ai-secondary)]/10"
                    endContent={<FiArrowRight />}
                  >
                    {t('plans.proYearly.cta')}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/subscriptions">
            <Button
              variant="flat"
              size="lg"
              className="font-medium"
              endContent={<FiArrowRight />}
            >
              {t('plans.free.cta')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
