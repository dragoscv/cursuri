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
                type: "spring",
                stiffness: 100,
                delay: index * 0.1
            }
        }
    };
    return (
        <motion.div
            className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] backdrop-filter backdrop-blur-lg rounded-xl p-6 h-full border border-[color:var(--ai-card-border)] shadow-lg dark:shadow-[color:var(--ai-card-border)]/20"
            variants={itemVariants}
            whileHover={{
                y: -5,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
            style={{
                '--hover-bg': 'rgba(var(--ai-primary-rgb), 0.07)'
            } as React.CSSProperties}
        >
            <div className="text-3xl mb-4 text-[color:var(--ai-primary)]">{t(`${featureKey}.icon`)}</div>
            <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-2">{t(`${featureKey}.title`)}</h3>
            <p className="text-[color:var(--ai-muted)]">{t(`${featureKey}.description`)}</p>
        </motion.div>
    )
}
