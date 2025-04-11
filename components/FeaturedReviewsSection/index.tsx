'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ReviewCard } from './ReviewCard'
import { useFeaturedReviews } from './hooks/useFeaturedReviews'
import { fallbackReviews } from './fallbackReviewData'
import ScrollAnimationWrapper from '../animations/ScrollAnimationWrapper'
import { Review } from '@/types'

export default function FeaturedReviewsSection() {
    // Get featured reviews using our custom hook
    const featuredReviews = useFeaturedReviews(3)

    // Fallback to mock data if no featured reviews are available
    const displayReviews = useMemo(() => {
        return featuredReviews.length > 0 ? featuredReviews : fallbackReviews
    }, [featuredReviews])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            What Our Students Say
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Hear from our community of developers who have transformed their skills
                            through our courses.
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
}
