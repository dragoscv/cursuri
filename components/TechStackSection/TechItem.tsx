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
    }

    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
        >
            <div className="flex items-center mb-4">
                <div
                    className="p-2 rounded-lg mr-4"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon size={28} className="text-gray-800 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold">{name}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </motion.div>
    )
}
