'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Reveal, Stagger, fadeUp } from '@/components/motion';
import SectionHeading from '@/components/shared/SectionHeading';

const LearningPathSection = memo(function LearningPathSection() {
  const t = useTranslations('home.learningPath');

  const pathSteps = [
    { key: 'fundamentals' },
    { key: 'frontend' },
    { key: 'backend' },
    { key: 'fullstack' },
  ] as const;

  return (
    <section className="relative w-full py-24 md:py-32 editorial-surface">
      <div aria-hidden className="absolute top-0 inset-x-0 cinematic-rim-divider" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal trigger="view" offset={28}>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            className="mb-16"
          />
        </Reveal>

        <Stagger
          gap={0.07}
          delay={0.1}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {pathSteps.map((step, index) => (
            <motion.div
              key={step.key}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="relative group rounded-2xl p-7 bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40 transition-colors"
            >
              {/* Step index — large faded numeral as editorial flourish */}
              <span
                aria-hidden
                className="absolute top-4 right-5 text-5xl font-semibold leading-none text-[color:var(--ai-primary)]/15 select-none tabular-nums"
              >
                {t(`steps.${step.key}.number`)}
              </span>

              {/* Connector dot rail (desktop) */}
              {index < pathSteps.length - 1 ? (
                <div
                  aria-hidden
                  className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-[color:var(--ai-primary)]/40 to-transparent"
                />
              ) : null}

              <h3 className="relative text-lg font-semibold text-[color:var(--ai-foreground)] mb-2 tracking-[-0.01em] pr-12">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="relative text-[14px] text-[color:var(--ai-muted)] leading-relaxed">
                {t(`steps.${step.key}.description`)}
              </p>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
});

export default LearningPathSection;
