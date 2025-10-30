'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@heroui/react';
import { FiChevronDown } from '@/components/icons/FeatherIcons';

export default function SubscriptionFAQ() {
  const t = useTranslations('subscription.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t('cancelAnytime.question'),
      answer: t('cancelAnytime.answer'),
    },
    {
      question: t('switchPlans.question'),
      answer: t('switchPlans.answer'),
    },
    {
      question: t('refundPolicy.question'),
      answer: t('refundPolicy.answer'),
    },
    {
      question: t('groupDiscount.question'),
      answer: t('groupDiscount.answer'),
    },
  ];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[color:var(--ai-foreground)]">
          {t('title')}
        </h2>
        <p className="text-lg text-[color:var(--ai-muted)]">{t('subtitle')}</p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card
            key={index}
            className="backdrop-blur-sm border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[color:var(--ai-card-border)]/5 transition-colors"
            >
              <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
                {faq.question}
              </h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <FiChevronDown
                  className="text-[color:var(--ai-primary)]"
                  size={24}
                />
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-[color:var(--ai-muted)] leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  );
}
