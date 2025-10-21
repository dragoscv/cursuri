'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ReviewCard } from './ReviewCard'
import { useFeaturedReviews } from './hooks/useFeaturedReviews'
import { getFallbackReviews } from './fallbackReviewData'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import { Review } from '@/types'

const FeaturedReviewsSection = React.memo(function FeaturedReviewsSection() {
    const t = useTranslations('home.reviews');

    // Get featured reviews using our custom hook
    const featuredReviews = useFeaturedReviews(3)

    // Fallback to mock data if no featured reviews are available
    const displayReviews = useMemo(() => {
        return featuredReviews.length > 0 ? featuredReviews : getFallbackReviews(t)
    }, [featuredReviews, t])

    // Memoize animation variants to prevent recreation
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }), []);

    return (
        <section className="py-16 bg-[color:var(--section-light-bg)] dark:bg-[color:var(--section-dark-bg)]">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[color:var(--ai-foreground)]">
                            {t('title')}
                        </h2>
                        <p className="text-[color:var(--ai-muted)] max-w-2xl mx-auto">
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
                >                    {displayReviews.map((review: Review, index: number) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        index={index}
                    />
                ))}
                </motion.div>
            </div>
        </section>
    )
});

export default FeaturedReviewsSection;
