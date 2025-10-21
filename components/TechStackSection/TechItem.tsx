'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

type TechItemProps = {
    techKey: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    index: number;
}

export default function TechItem({ techKey, Icon, color, index }: TechItemProps) {
    const t = useTranslations('home.techStack.technologies');

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                delay: index * 0.1
            }
        }
    };
    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] shadow-md hover:shadow-lg dark:shadow-[color:var(--ai-card-border)]/10 transition-shadow border border-[color:var(--ai-card-border)]/30 dark:border-[color:var(--ai-card-border)]/30"
        >
            <div className="flex items-center mb-4">
                <div
                    className="p-2 rounded-lg mr-4 bg-[color:var(--ai-primary)]/10"
                >
                    <Icon size={28} className="text-[color:var(--ai-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--ai-foreground)]">{t(`${techKey}.name`)}</h3>
            </div>
            <p className="text-[color:var(--ai-muted)]">{t(`${techKey}.description`)}</p>
        </motion.div>
    )
}
