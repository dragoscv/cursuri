'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import TechItem from './TechItem'
import { technologies } from './techData'

const TechStackSection = React.memo(function TechStackSection() {
    // Memoize containerVariants to prevent recreation
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }), []); return (
        <section className="relative w-full py-20 bg-[color:var(--section-light-bg)] dark:bg-[color:var(--section-dark-bg)]">
            <div className="container mx-auto px-4">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[color:var(--ai-foreground)]">Tehnologii pe care le vei învăța</h2>
                        <p className="text-[color:var(--ai-muted)] max-w-2xl mx-auto">
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
                </ScrollAnimationWrapper>
            </div>
        </section>
    )
});

export default TechStackSection;
