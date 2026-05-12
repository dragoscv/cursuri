'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Reveal, Stagger, fadeUp } from '@/components/motion';
import SectionHeading from '@/components/shared/SectionHeading';
import { technologies } from './techData';

const TechStackSection = memo(function TechStackSection() {
  const t = useTranslations('home.techStack');
  const tTech = useTranslations('home.techStack.technologies');

  return (
    <section className="relative w-full py-24 md:py-32 bg-[color:var(--ai-background)]">
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
          gap={0.05}
          delay={0.08}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.key}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                className="group rounded-2xl p-6 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-amber-500/40 transition-colors"
              >
                <div className="w-11 h-11 mb-4 inline-flex items-center justify-center rounded-xl border border-[color:var(--ai-card-border)] text-amber-500 group-hover:border-amber-500/40 transition-colors">
                  <Icon size={22} className="text-[color:var(--ai-primary)]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[color:var(--ai-foreground)] mb-1.5 tracking-[-0.01em]">
                  {tTech(`${tech.key}.name`)}
                </h3>
                <p className="text-[13px] text-[color:var(--ai-muted)] leading-relaxed">
                  {tTech(`${tech.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
});

export default TechStackSection;
