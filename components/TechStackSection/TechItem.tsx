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
                type: "spring" as const,
                stiffness: 100,
                delay: index * 0.1
            }
        }
    };
    return (
        <motion.div
            variants={itemVariants}
            className="group p-6 rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/30 shadow-sm hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4 }}
        >
            <div className="flex items-center mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/5 mr-4">
                    <Icon size={24} className="text-[color:var(--ai-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-[color:var(--ai-foreground)]">{t(`${techKey}.name`)}</h3>
            </div>
            <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed">{t(`${techKey}.description`)}</p>
        </motion.div>
    )
}
