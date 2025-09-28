'use client'

import React, { useRef, useEffect } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { Review } from '@/types'
import RatingStars from '../ui/RatingStars'

export type ReviewCardProps = {
    review: Review;
    index: number;
}

export function ReviewCard({ review, index }: ReviewCardProps) {
    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, amount: 0.3 })

    useEffect(() => {
        if (isInView) {
            controls.start('visible')
        }
    }, [controls, isInView])

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.1 * index
            }
        }
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={cardVariants}
            className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl p-6 shadow-lg dark:shadow-[color:var(--ai-card-border)]/10 border border-[color:var(--ai-card-border)]/30 dark:border-[color:var(--ai-card-border)]/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <RatingStars rating={review.rating} />
                    <p className="text-sm text-[color:var(--ai-muted)] mt-1">
                        {review.courseType || "Course"}
                    </p>
                </div>
            </div>            <p className="text-[color:var(--ai-foreground)] opacity-80 mb-6">
                &quot;{review.content}&quot;
            </p>

            <div className="flex items-center">
                {review.author?.avatar && (
                    <div className="mr-4">
                        <img
                            src={review.author.avatar}
                            alt={review.author.name || review.userName || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </div>
                )}
                <div>
                    <h4 className="font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                        {review.author?.name || review.userName || "Anonymous User"}
                    </h4>
                    <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                        {review.author?.role || review.userRole || "Student"}
                    </p>
                </div>      </div>
        </motion.div>
    )
}

// Add a named export as well as default export for better compatibility
export default ReviewCard;
