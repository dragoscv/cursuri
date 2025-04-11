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
    }

    return (
        <motion.div
            className="bg-white/10 dark:bg-white/5 backdrop-filter backdrop-blur-lg rounded-xl p-6 h-full border border-white/20 dark:border-white/10 shadow-xl"
            variants={itemVariants}
            whileHover={{
                y: -5,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
            }}
        >
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/70">{description}</p>
        </motion.div>
    )
}
