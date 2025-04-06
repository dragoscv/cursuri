'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';
import { useContext } from 'react';
import { AppContext } from './AppContext';

export default function CallToActionSection() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }

    const { openModal, closeModal, user } = context;

    // Pre-calculate grid opacity values to avoid hydration mismatch
    const gridOpacities = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            // Deterministic opacity calculation with fixed precision
            return (0.1 + (Math.sin(i * 0.1) * 0.15 + 0.25)).toFixed(5);
        });
    }, []);

    // Pre-calculate floating orbs properties
    const floatingOrbs = useMemo(() => {
        // Use a seeded random function for consistent values between server and client
        const seededRandom = (seed: number): number => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        return Array.from({ length: 6 }).map((_, i) => {
            // Use index as seed for deterministic randomness
            const widthSeed = i * 3.1;
            const heightSeed = i * 4.2;
            const topSeed = i * 5.3;
            const leftSeed = i * 6.4;
            const xMoveSeed = i * 7.5;
            const yMoveSeed = i * 8.6;
            const durationSeed = i * 9.7;

            // Use fixed string values for ALL properties to prevent hydration mismatches
            return {
                key: i,
                width: (seededRandom(widthSeed) * 200 + 50).toFixed(4),
                height: (seededRandom(heightSeed) * 200 + 50).toFixed(4),
                top: (seededRandom(topSeed) * 100).toFixed(4),
                left: (seededRandom(leftSeed) * 100).toFixed(4),
                xMove: (seededRandom(xMoveSeed) * 50 - 25).toFixed(4),
                yMove: (seededRandom(yMoveSeed) * 50 - 25).toFixed(4),
                duration: (5 + seededRandom(durationSeed) * 5).toFixed(4)
            };
        });
    }, []);

    const handleGetStarted = () => {
        if (!user) {
            openModal({
                id: 'login',
                isOpen: true,
                hideCloseButton: false,
                backdrop: 'blur',
                size: 'full',
                scrollBehavior: 'inside',
                isDismissable: true,
                modalHeader: 'Autentificare',
                modalBody: <div>Login Component</div>,
                headerDisabled: true,
                footerDisabled: true,
                noReplaceURL: true,
                onClose: () => closeModal('login'),
            });
        } else {
            // Smooth scroll to courses section
            const coursesSection = document.getElementById('courses-section');
            coursesSection?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background with animated gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)]/90 via-[color:var(--ai-secondary)]/80 to-[color:var(--ai-accent)]/70"
            />

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 grid grid-cols-12 gap-2 transform -skew-y-12 scale-150">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className="col-span-1 bg-white h-8 animate-pulse"
                                style={{
                                    animationDelay: `${i * 0.1}s`,
                                    opacity: gridOpacities[i]
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Floating orbs with pre-calculated values */}
                <div className="absolute inset-0">
                    {floatingOrbs.map(orb => (
                        <motion.div
                            key={orb.key}
                            className="absolute rounded-full bg-white/10 blur-xl"
                            style={{
                                width: `${orb.width}px`,
                                height: `${orb.height}px`,
                                top: `${orb.top}%`,
                                left: `${orb.left}%`,
                            }}
                            animate={{
                                x: [0, parseFloat(orb.xMove)],
                                y: [0, parseFloat(orb.yMove)],
                            }}
                            transition={{
                                duration: parseFloat(orb.duration),
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <ScrollAnimationWrapper>
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Become a Pro Developer?
                        </h2>
                    </ScrollAnimationWrapper>

                    <ScrollAnimationWrapper delay={0.1}>
                        <p className="text-xl text-indigo-200 mb-8">
                            Join thousands of students already learning on our platform and accelerate your career.
                        </p>
                    </ScrollAnimationWrapper>

                    <ScrollAnimationWrapper delay={0.2}>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    color="primary"
                                    size="lg"
                                    radius="full"
                                    className="px-8 py-6 text-lg font-medium bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] hover:shadow-lg hover:shadow-[color:var(--ai-primary)]/30 transform transition-all duration-300"
                                    onClick={handleGetStarted}
                                >
                                    Get Started Now
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="bordered"
                                    color="secondary"
                                    size="lg"
                                    radius="full"
                                    className="px-8 py-6 text-lg font-medium border-[color:var(--ai-secondary)]/50 text-white backdrop-blur-sm hover:bg-white/10 transform transition-all duration-300"
                                    onClick={() => {
                                        // Smooth scroll to courses section
                                        const coursesSection = document.getElementById('courses-section');
                                        coursesSection?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Browse Courses
                                </Button>
                            </motion.div>
                        </div>
                    </ScrollAnimationWrapper>

                    {/* Trust badges */}
                    <ScrollAnimationWrapper delay={0.3}>
                        <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
                            <div className="text-indigo-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>30-Day Money Back Guarantee</span>
                            </div>
                            <div className="text-indigo-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Lifetime Access</span>
                            </div>
                            <div className="text-indigo-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Certificate of Completion</span>
                            </div>
                        </div>
                    </ScrollAnimationWrapper>
                </div>
            </div>
        </section>
    );
}