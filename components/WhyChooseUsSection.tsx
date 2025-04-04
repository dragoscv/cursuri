'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';
import ParallaxSection from './animations/ParallaxSection';

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
            bgColor="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900"
            speed={0.2}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Why Choose Our Platform
                        </h2>
                        <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
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
                                className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-xl p-6 h-full border border-white/20 shadow-xl"
                                whileHover={{
                                    y: -5,
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                }}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-indigo-200">{feature.description}</p>
                            </motion.div>
                        </ScrollAnimationWrapper>
                    ))}
                </motion.div>

                {/* Floating elements for visual interest */}
                <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-purple-600/20 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-violet-500/30 blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Neural network-like connectors */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                </defs>
                {/* Horizontal lines */}
                <line x1="20" y1="20" x2="80" y2="20" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
                <line x1="30" y1="80" x2="70" y2="80" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />

                {/* Vertical lines */}
                <line x1="30" y1="10" x2="30" y2="90" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
                <line x1="70" y1="10" x2="70" y2="90" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />

                {/* Nodes */}
                <circle cx="30" cy="20" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="50" cy="20" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="70" cy="20" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="30" cy="50" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="50" cy="50" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="70" cy="50" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="30" cy="80" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="50" cy="80" r="1" fill="#8B5CF6" className="neural-node" />
                <circle cx="70" cy="80" r="1" fill="#8B5CF6" className="neural-node" />
            </svg>
        </ParallaxSection>
    );
}