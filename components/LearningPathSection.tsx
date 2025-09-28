'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';

export default function LearningPathSection() {
    const pathSteps = [
        {
            number: "01",
            title: "Core Fundamentals",
            description: "Master the essential building blocks of modern web development with HTML, CSS, and JavaScript.",
            color: "from-[color:var(--ai-primary)] to-[color:var(--ai-primary)]/70"
        },
        {
            number: "02",
            title: "Frontend Development",
            description: "Build interactive user interfaces with React, TypeScript, and modern CSS frameworks.",
            color: "from-[color:var(--ai-secondary)] to-[color:var(--ai-secondary)]/70"
        },
        {
            number: "03",
            title: "Backend Integration",
            description: "Create robust server-side applications with Node.js and integrate with databases.",
            color: "from-[color:var(--ai-accent)] to-[color:var(--ai-accent)]/70"
        },
        {
            number: "04",
            title: "Full Stack Projects",
            description: "Combine frontend and backend skills to build complete, production-ready applications.",
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
                ease: [0.22, 1, 0.36, 1]
            }
        }
    }; return (
        <section className="relative w-full py-24 bg-[color:var(--ai-background)] dark:bg-[color:var(--ai-background)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-[color:var(--ai-foreground)]">
                            Your Learning Journey
                        </h2>
                        <p className="text-xl text-[color:var(--ai-muted)] max-w-3xl mx-auto">
                            A structured path to take you from basics to professional developer
                        </p>
                    </div>
                </ScrollAnimationWrapper>

                <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] hidden md:block"></div>

                    <div className="space-y-24 relative">
                        {pathSteps.map((step, index) => (
                            <div key={step.number} className="relative">
                                <ScrollAnimationWrapper delay={index * 0.1}>
                                    <div className={`md:flex ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} items-center gap-8`}>
                                        {/* Step number with gradient background */}
                                        <motion.div
                                            className={`relative z-10 flex-shrink-0 w-20 h-20 mx-auto md:mx-0 rounded-full bg-gradient-to-r ${step.color} shadow-lg flex items-center justify-center mb-6 md:mb-0`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <span className="text-2xl font-bold text-white">{step.number}</span>
                                        </motion.div>

                                        {/* Content section with glass morphism effect */}
                                        <motion.div
                                            className="relative flex-grow p-8 rounded-xl bg-[color:var(--ai-card-bg)]/90 dark:bg-[color:var(--ai-card-bg)]/90 backdrop-blur-md border border-[color:var(--ai-card-border)] shadow-xl"
                                            variants={fadeInUpVariants}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ delay: index * 0.2 }}
                                        >
                                            <h3 className="text-2xl font-bold mb-3 text-[color:var(--ai-foreground)]">{step.title}</h3>
                                            <p className="text-[color:var(--ai-muted)]">{step.description}</p>
                                        </motion.div>
                                    </div>
                                </ScrollAnimationWrapper>

                                {/* Dots pattern for visual interest */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none">
                                    <div className="h-full w-full" style={{
                                        backgroundImage: 'radial-gradient(rgba(var(--ai-primary-rgb), 0.6) 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}