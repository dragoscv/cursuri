'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import StatCounter from './StatCounter'
import AnimatedParticles from './AnimatedParticles'
import { statisticsData } from './statsData'

export default function StatisticsSection() {
    const t = useTranslations('home.statistics')
    const ref = React.useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Create parallax effect for the background
    const y = useTransform(scrollYProgress, [0, 1], [0, 100])

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
        <section ref={ref} className="relative py-16 md:py-20 overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                style={{
                    backgroundSize: "200% 200%",
                    y,
                    backgroundPosition: "0% 0%",
                }}
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                    duration: 20,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />

            {/* Animated particles */}
            <AnimatedParticles />

            <div className="container mx-auto px-4 relative z-10">
                <ScrollAnimationWrapper>
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                        {t('title')}
                    </h2>
                </ScrollAnimationWrapper>

                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {statisticsData.map((stat, index) => (
                        <StatCounter
                            key={stat.label}
                            value={t(`${stat.label}.value`)}
                            label={t(`${stat.label}.label`)}
                            icon={stat.icon}
                            color={stat.color}
                            index={index}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
