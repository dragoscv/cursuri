'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';

const LearningPathSection = React.memo(function LearningPathSection() {
    const t = useTranslations('home.learningPath');

    const pathSteps = [
        {
            number: t('steps.fundamentals.number'),
            title: t('steps.fundamentals.title'),
            description: t('steps.fundamentals.description'),
            color: "from-[color:var(--ai-primary)] to-[color:var(--ai-primary)]/70"
        },
        {
            number: t('steps.frontend.number'),
            title: t('steps.frontend.title'),
            description: t('steps.frontend.description'),
            color: "from-[color:var(--ai-secondary)] to-[color:var(--ai-secondary)]/70"
        },
        {
            number: t('steps.backend.number'),
            title: t('steps.backend.title'),
            description: t('steps.backend.description'),
            color: "from-[color:var(--ai-accent)] to-[color:var(--ai-accent)]/70"
        },
        {
            number: t('steps.fullstack.number'),
            title: t('steps.fullstack.title'),
            description: t('steps.fullstack.description'),
            color: "from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
        }
    ];

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
            }
        }
    };

    return (
        <section className="relative w-full py-20 md:py-28 bg-[color:var(--section-accent-bg)] dark:bg-[color:var(--section-dark-bg)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-14">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] border border-[color:var(--ai-primary)]/20 mb-4">
                            {t('title')}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[color:var(--ai-foreground)]">
                            {t('title')}
                        </h2>
                        <p className="text-lg text-[color:var(--ai-muted)] max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>
                </ScrollAnimationWrapper>

                {/* Horizontal steps on desktop, vertical on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pathSteps.map((step, index) => (
                        <ScrollAnimationWrapper key={step.number} delay={index * 0.1} className="h-full">
                            <motion.div
                                className="relative h-full p-6 rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/30 hover:shadow-lg transition-all duration-300"
                                variants={fadeInUpVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{ y: -4 }}
                            >
                                {/* Step number */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white text-lg font-bold mb-4 shadow-md`}>
                                    {step.number}
                                </div>

                                {/* Connector line (desktop only) */}
                                {index < pathSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)]/30 to-transparent z-10" />
                                )}

                                <h3 className="text-xl font-bold mb-2 text-[color:var(--ai-foreground)]">{step.title}</h3>
                                <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed">{step.description}</p>
                            </motion.div>
                        </ScrollAnimationWrapper>
                    ))}
                </div>
            </div>
        </section>
    );
});

export default LearningPathSection;