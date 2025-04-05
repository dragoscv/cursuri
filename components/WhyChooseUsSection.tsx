'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';
import ParallaxSection from './animations/ParallaxSection';
import NeuralNetworkIcon from './icons/NeuralNetworkIcon';

export default function WhyChooseUsSection() {
    const features = [
        {
            icon: "🚀",
            title: "Project-Based Learning",
            description: "Build real-world projects that you can add to your portfolio right away."
        },
        {
            icon: "👨‍💻",
            title: "Expert Instructors",
            description: "Learn from industry professionals with years of practical experience."
        },
        {
            icon: "🔄",
            title: "Continuous Updates",
            description: "All courses are regularly updated to keep pace with latest technologies."
        },
        {
            icon: "🌐",
            title: "Full-Stack Focus",
            description: "Learn both frontend and backend to become a complete developer."
        },
        {
            icon: "🤝",
            title: "Supportive Community",
            description: "Join a community of learners and get help when you need it."
        },
        {
            icon: "📱",
            title: "Mobile & Desktop Access",
            description: "Learn on any device, anytime, with our responsive platform."
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <ParallaxSection
            className="py-24 relative"
            bgColor="bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
            speed={0.2}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Why Choose Our Platform
                        </h2>
                        <p className="text-xl text-white/80 max-w-3xl mx-auto">
                            We've designed our learning experience with developers in mind, focusing on what matters most
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
                        <ScrollAnimationWrapper
                            key={feature.title}
                            delay={index * 0.1}
                            className="h-full"
                        >
                            <motion.div
                                className="bg-white/10 dark:bg-white/5 backdrop-filter backdrop-blur-lg rounded-xl p-6 h-full border border-white/20 dark:border-white/10 shadow-xl"
                                whileHover={{
                                    y: -5,
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                }}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-white/80">{feature.description}</p>
                            </motion.div>
                        </ScrollAnimationWrapper>
                    ))}
                </motion.div>

                {/* Floating elements for visual interest */}
                <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-[color:var(--ai-secondary)]/20 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-[color:var(--ai-primary)]/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-[color:var(--ai-accent)]/30 blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Neural network-like connectors */}
            <NeuralNetworkIcon />
        </ParallaxSection>
    );
}