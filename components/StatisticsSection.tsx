'use client';

import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';

export default function StatisticsSection() {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Create parallax effect for the background
    const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const stats = [
        { value: "15+", label: "Courses", icon: "📚", color: "from-[color:var(--ai-primary)] to-[color:var(--ai-primary)]/80" },
        { value: "2,500+", label: "Students", icon: "👨‍🎓", color: "from-[color:var(--ai-secondary)] to-[color:var(--ai-secondary)]/80" },
        { value: "10,000+", label: "Hours of Content", icon: "⏱️", color: "from-[color:var(--ai-accent)] to-[color:var(--ai-accent)]/80" },
        { value: "4.8", label: "Average Rating", icon: "⭐", color: "from-amber-500 to-amber-400" }
    ];

    const counterVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    // Pre-calculate particle properties with fixed precision to avoid hydration mismatch
    const particles = useMemo(() => {
        // Use a deterministic seed for consistent values
        const seed = 42;
        const particles = [];

        function pseudoRandom(seed: number, index: number): number {
            // Deterministic pseudo-random generator
            return parseFloat(((Math.sin(seed * index) * 10000) % 1).toFixed(2));
        }

        for (let i = 0; i < 20; i++) {
            // Create fixed-precision values that will be consistent
            const width = (5 + pseudoRandom(seed, i * 1.1) * 10).toFixed(2);
            const height = (5 + pseudoRandom(seed, i * 2.2) * 15).toFixed(2);
            const top = (pseudoRandom(seed, i * 3.3) * 100).toFixed(2);
            const left = (pseudoRandom(seed, i * 4.4) * 100).toFixed(2);
            const duration = (3 + pseudoRandom(seed, i * 5.5) * 5).toFixed(2);
            const delay = (pseudoRandom(seed, i * 6.6) * 5).toFixed(2);

            particles.push({
                key: i,
                width,
                height,
                top,
                left,
                duration,
                delay
            });
        }

        return particles;
    }, []); return (
        <section className="relative w-full overflow-hidden">
            <div ref={ref} className="relative py-16 md:py-20 overflow-hidden">
                {/* Simplified animated gradient background */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                    style={{
                        backgroundSize: "200% 200%",
                        y,
                        backgroundPosition: "0% 0%",
                    }}
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />

                {/* Subtle dot pattern overlay - reduced opacity */}
                <div className="absolute inset-0 bg-black/20 z-0" style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Main content container */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollAnimationWrapper>
                        <div className="text-center mb-8 md:mb-16">
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-white/10 text-white/90 backdrop-blur-sm mb-3">
                                Our Achievements
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white">
                                Our Impact in Numbers
                            </h2>
                        </div>
                    </ScrollAnimationWrapper>

                    {/* Stats Grid - Redesigned for better mobile experience */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {stats.map((stat, index) => (
                            <ScrollAnimationWrapper
                                key={stat.label}
                                delay={index * 0.1}
                                className="h-full"
                            >
                                <motion.div
                                    className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-20 backdrop-filter backdrop-blur-md border border-white/10 h-full text-center shadow-lg transform transition-all duration-300`}
                                    variants={counterVariants}
                                    whileHover={{
                                        scale: 1.03,
                                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                    }}
                                >
                                    <div className="text-2xl md:text-4xl mb-2 md:mb-3 bg-white/20 p-3 rounded-full">{stat.icon}</div>
                                    <motion.div
                                        className="text-3xl md:text-5xl font-extrabold text-white mb-1 md:mb-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.1 + index * 0.1,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                    >
                                        {stat.value}
                                    </motion.div>
                                    <div className="text-sm md:text-xl font-medium text-white/90">{stat.label}</div>
                                </motion.div>
                            </ScrollAnimationWrapper>
                        ))}
                    </div>

                    {/* Mobile-friendly caption */}
                    <div className="mt-10 text-center">
                        <ScrollAnimationWrapper delay={0.4}>
                            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
                                Join thousands of students who are already enhancing their skills through our platform.
                            </p>
                        </ScrollAnimationWrapper>
                    </div>
                </div>

                {/* Reduced number of floating particles for mobile - only shown on larger screens */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden md:block">
                    {particles.slice(0, 10).map((particle) => (
                        <div
                            key={particle.key}
                            className="absolute rounded-full bg-white/15"
                            style={{
                                width: `${particle.width}px`,
                                height: `${particle.height}px`,
                                top: `${particle.top}%`,
                                left: `${particle.left}%`,
                                animation: `floating ${particle.duration}s ease-in-out infinite alternate`,
                                animationDelay: `${particle.delay}s`
                            }}
                        />
                    ))}
                </div>

                {/* Strategic glow effects instead of random blurs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Top left glow */}
                    <div
                        className="absolute rounded-full bg-[color:var(--ai-primary)]/20 blur-3xl"
                        style={{
                            width: "20vw",
                            height: "20vw",
                            top: "10%",
                            left: "5%"
                        }}
                    />
                    {/* Bottom right glow */}
                    <div
                        className="absolute rounded-full bg-[color:var(--ai-secondary)]/20 blur-3xl"
                        style={{
                            width: "25vw",
                            height: "25vw",
                            bottom: "10%",
                            right: "5%"
                        }}
                    />            </div>
            </div>
        </section>
    );
}