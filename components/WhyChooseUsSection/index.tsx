'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Reveal, Stagger, fadeUp } from '@/components/motion';
import SectionHeading from '@/components/shared/SectionHeading';
import { features } from './featuresData';

const WhyChooseUsSection = memo(function WhyChooseUsSection() {
  const t = useTranslations('home.whyChooseUs');
  const tFeatures = useTranslations('home.whyChooseUs.features');

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
          gap={0.06}
          delay={0.1}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.key}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="group relative rounded-2xl p-7 bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40 transition-colors"
            >
              <div className="text-2xl mb-4 w-12 h-12 inline-flex items-center justify-center rounded-xl bg-[color:var(--ai-primary)]/8 group-hover:bg-[color:var(--ai-primary)]/15 transition-colors">
                {tFeatures(`${feature.key}.icon`)}
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2 tracking-[-0.01em]">
                {tFeatures(`${feature.key}.title`)}
              </h3>
              <p className="text-[14px] text-[color:var(--ai-muted)] leading-relaxed">
                {tFeatures(`${feature.key}.description`)}
              </p>
            </motion.article>
          ))}
        </Stagger>
      </div>
    </section>
  );
});

export default WhyChooseUsSection;
