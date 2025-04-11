'use client'

import React from 'react'
import { motion } from 'framer-motion'

type StatCounterProps = {
    value: string;
    label: string;
    icon: string;
    color: string;
    index: number;
}

export default function StatCounter({ value, label, icon, color, index }: StatCounterProps) {
    // Animation variants for the counter
    const counterVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: index * 0.1
            }
        }
    }    return (
        <motion.div
            className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg dark:shadow-xl dark:shadow-[color:var(--ai-card-border)]/10`}
            variants={counterVariants}
            style={{
                backgroundImage: `linear-gradient(to bottom right, var(--ai-${color}-start, ${color}), var(--ai-${color}-end, ${color}))`
            }}
        >
            <div className="flex items-center mb-2">
                <span className="text-2xl mr-2 text-white dark:text-white">{icon}</span>
                <h3 className="text-xl font-bold text-white dark:text-white">{label}</h3>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white dark:text-white">{value}</div>
        </motion.div>
    )
}
