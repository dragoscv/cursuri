'use client'

import React from 'react'
import { motion } from 'framer-motion'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import TechItem from './TechItem'
import { technologies } from './techData'

export default function TechStackSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <ScrollAnimationWrapper>
            <section id="tech-stack-section" className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Tehnologii pe care le vei învăța</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Explorează stack-ul modern de tehnologii web și mobile pe care îl acoperim în cursurile noastre.
                            Fiecare tehnologie este predată prin proiecte practice.
                        </p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {technologies.map((tech, index) => (
                            <TechItem
                                key={tech.name}
                                name={tech.name}
                                Icon={tech.icon}
                                description={tech.description}
                                color={tech.color}
                                index={index}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>
        </ScrollAnimationWrapper>
    )
}
