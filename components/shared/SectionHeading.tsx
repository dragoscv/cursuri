'use client';

/**
 * SectionHeading — unified eyebrow + display title + optional subtitle block.
 *
 * Used across home sections (Statistics, TechStack, LearningPath, WhyChooseUs)
 * to keep the editorial language consistent. Eyebrow renders as a small
 * uppercase label with letter-spacing in the primary color; the title uses
 * the cinematic clamp scale with tight tracking; the subtitle is muted body.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Stagger, fadeUp } from '@/components/motion';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: Props) {
  const alignClass =
    align === 'center' ? 'text-center mx-auto items-center' : 'text-left mx-0 items-start';

  return (
    <Stagger gap={0.07} delay={0.05} className={`flex flex-col ${alignClass} ${className}`}>
      {eyebrow ? (
        <motion.p
          variants={fadeUp}
          className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[color:var(--ai-primary)] mb-4"
        >
          {eyebrow}
        </motion.p>
      ) : null}

      <motion.h2
        variants={fadeUp}
        className="text-[clamp(1.875rem,4vw,3rem)] font-semibold tracking-[-0.02em] leading-[1.1] text-[color:var(--ai-foreground)] max-w-3xl"
      >
        {title}
      </motion.h2>

      {subtitle ? (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-lg text-[color:var(--ai-muted)] leading-relaxed max-w-2xl"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </Stagger>
  );
}

export default SectionHeading;
