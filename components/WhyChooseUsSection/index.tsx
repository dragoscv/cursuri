'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import FeatureCard from './FeatureCard'
import { features } from './featuresData'

const WhyChooseUsSection = React.memo(function WhyChooseUsSection() {
    const t = useTranslations('home.whyChooseUs');

    // Memoize containerVariants to prevent recreation
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }), []);
    return (
        <section className="relative w-full py-20 md:py-28 bg-[color:var(--ai-background)] overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[color:var(--ai-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[color:var(--ai-secondary)]/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-14">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] border border-[color:var(--ai-primary)]/20 mb-4">
                            {t('title')}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[color:var(--ai-foreground)] mb-4">
                            {t('title')}
                        </h2>
                        <p className="text-lg text-[color:var(--ai-muted)] max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>
                </ScrollAnimationWrapper>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, index) => (
                        <ScrollAnimationWrapper key={feature.key} delay={index * 0.1} className="h-full">
                            <FeatureCard
                                featureKey={feature.key}
                                index={index}
                            />
                        </ScrollAnimationWrapper>
                    ))}
                </motion.div>
            </div>
        </section>
    )
});

export default WhyChooseUsSection;
