'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

type FeatureCardProps = {
    featureKey: string;
    index: number;
}

export default function FeatureCard({ featureKey, index }: FeatureCardProps) {
    const t = useTranslations('home.whyChooseUs.features');

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                delay: index * 0.1
            }
        }
    };
    return (
        <motion.div
            className="bg-[color:var(--ai-card-bg)] rounded-2xl p-6 h-full border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/30 shadow-sm hover:shadow-lg transition-all duration-300"
            variants={itemVariants}
            whileHover={{ y: -4 }}
        >
            <div className="text-3xl mb-4 p-3 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/5 w-fit">{t(`${featureKey}.icon`)}</div>
            <h3 className="text-lg font-bold text-[color:var(--ai-foreground)] mb-2">{t(`${featureKey}.title`)}</h3>
            <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed">{t(`${featureKey}.description`)}</p>
        </motion.div>
    )
}
