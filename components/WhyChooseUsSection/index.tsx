'use client'

import React from 'react'
import { motion } from 'framer-motion'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import ParallaxSection from '../animations/ParallaxSection'
import FeatureCard from './FeatureCard'
import { features } from './featuresData'

export default function WhyChooseUsSection() {
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
        <section className="relative w-full">
            <ParallaxSection
                className="py-24 relative w-full"
                bgColor="bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                speed={0.2}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">                    <ScrollAnimationWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Why Choose Our Platform
                        </h2>                        <p className="text-xl text-white/80 max-w-3xl mx-auto">
                            We&apos;ve designed our learning experience with developers in mind, focusing on what matters most
                        </p>
                    </div>
                </ScrollAnimationWrapper>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {features.map((feature, index) => (
                            <ScrollAnimationWrapper key={feature.title} delay={index * 0.1} className="h-full">
                                <FeatureCard
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    index={index}
                                />
                            </ScrollAnimationWrapper>
                        ))}
                    </motion.div>                    <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
                        <svg className="absolute right-0 top-0 h-full transform translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
                            <defs>
                                <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="10" cy="10" r="2" fill="currentColor" fillOpacity="0.8" />
                                </pattern>
                            </defs>
                            <rect width="404" height="784" fill="url(#pattern-circles)" className="text-white/20" />
                        </svg>
                        <svg className="absolute left-0 bottom-0 h-full transform -translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
                            <defs>
                                <pattern id="pattern-circles-2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="10" cy="10" r="2" fill="currentColor" fillOpacity="0.8" />
                                </pattern>
                            </defs>
                            <rect width="404" height="784" fill="url(#pattern-circles-2)" className="text-white/20" />
                        </svg>                </div>
                </div>
            </ParallaxSection>
        </section>
    )
}
