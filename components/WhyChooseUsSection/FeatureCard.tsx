'use client'

import React from 'react'
import { motion } from 'framer-motion'

type FeatureCardProps = {
    icon: string;
    title: string;
    description: string;
    index: number;
}

export default function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
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
            <div className="text-3xl mb-4 text-[color:var(--ai-primary)]">{icon}</div>
            <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-2">{title}</h3>
            <p className="text-[color:var(--ai-muted)]">{description}</p>
        </motion.div>
    )
}
