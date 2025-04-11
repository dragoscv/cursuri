'use client'

import React from 'react'
import { motion } from 'framer-motion'

type TechItemProps = {
    name: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
    color: string;
    index: number;
}

export default function TechItem({ name, Icon, description, color, index }: TechItemProps) {
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
    }    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-xl bg-white dark:bg-[color:var(--ai-card-bg)] shadow-md hover:shadow-lg dark:shadow-[color:var(--ai-card-border)]/10 transition-shadow border border-transparent dark:border-[color:var(--ai-card-border)]/30"
        >
            <div className="flex items-center mb-4">
                <div
                    className="p-2 rounded-lg mr-4"
                    style={{
                        backgroundColor: `${color}15`,
                        color: color
                    }}
                >
                    <Icon size={28} className="text-[color:var(--ai-foreground)]" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--ai-foreground)]">{name}</h3>
            </div>
            <p className="text-[color:var(--ai-muted)]">{description}</p>
        </motion.div>
    )
}
