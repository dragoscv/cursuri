'use client'

import React, { useRef, useEffect, useContext, useState, useMemo } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { AppContext } from './AppContext'
import { Review } from '@/types'

export default function FeaturedReviews() {
    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, amount: 0.3 })
    const [featuredReviews, setFeaturedReviews] = useState<Review[]>([])

    // Get context data
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { courses, reviews, getCourseReviews } = context

    // Fetch reviews for all courses when component mounts
    useEffect(() => {
        const fetchReviews = async () => {
            // Fetch reviews for each course if they haven't been fetched yet
            const courseIds = Object.keys(courses)
            courseIds.forEach(courseId => {
                getCourseReviews(courseId)
            })
        }

        if (Object.keys(courses).length > 0) {
            fetchReviews()
        }
    }, [courses, getCourseReviews])

    // Process reviews and select featured ones when reviews or courses change
    useEffect(() => {
        const processReviews = () => {
            const allReviews: Review[] = []

            // Collect all reviews from all courses
            Object.keys(reviews).forEach(courseId => {
                const courseReviews = reviews[courseId]
                const courseName = courses[courseId]?.name || 'AI Course'

                // Only proceed if courseReviews exists and is an object
                if (courseReviews && typeof courseReviews === 'object') {
                    Object.keys(courseReviews).forEach(reviewId => {
                        // Use a safer approach to access the review
                        const reviewsObject = courseReviews as Record<string, any>;
                        const review = reviewsObject[reviewId];

                        // Only include reviews that have content and at least 4 stars
                        if (review && typeof review === 'object' && review.content && review.rating >= 4) {
                            allReviews.push({
                                id: reviewId,
                                courseId: courseId,
                                courseType: review.courseType || courseName,
                                content: review.content,
                                rating: review.rating,
                                userName: review.userName,
                                userRole: review.userRole,
                                author: review.author
                            })
                        }
                    })
                }
            })

            // Sort by rating (highest first) and then select the top 3
            const sorted = allReviews.sort((a, b) => b.rating - a.rating)
            setFeaturedReviews(sorted.slice(0, 3))
        }

        // Only process reviews if we have both courses and reviews data
        if (Object.keys(courses).length > 0 && Object.keys(reviews).length > 0) {
            processReviews()
        }
    }, [courses, reviews])

    useEffect(() => {
        if (isInView) {
            controls.start('visible')
        }
    }, [controls, isInView])

    // Fallback to mock data if no featured reviews are available
    const displayReviews = useMemo((): Review[] => {
        if (featuredReviews.length === 0) {
            return [
                {
                    id: 1,
                    content: "The AI prediction models taught in this course completely transformed my approach to data analysis. The real-time feedback system makes learning intuitive and effective.",
                    author: {
                        name: "Alex Johnson",
                        role: "AI Research Engineer",
                        avatar: "https://i.pravatar.cc/150?img=11"
                    },
                    rating: 5,
                    courseType: "Predictive Analysis"
                },
                {
                    id: 2,
                    content: "I've taken many ML courses before, but the neural network visualization tools here made complex concepts crystal clear. The hands-on projects with cutting-edge tech were invaluable.",
                    author: {
                        name: "Maria Garcia",
                        role: "Machine Learning Specialist",
                        avatar: "https://i.pravatar.cc/150?img=5"
                    },
                    rating: 5,
                    courseType: "Neural Networks"
                },
                {
                    id: 3,
                    content: "This platform's approach to teaching transformer models is revolutionary. I went from basic understanding to implementing advanced NLP systems in just weeks.",
                    author: {
                        name: "David Kim",
                        role: "NLP Developer",
                        avatar: "https://i.pravatar.cc/150?img=8"
                    },
                    rating: 4,
                    courseType: "NLP & Transformers"
                },
            ];
        }
        return featuredReviews;
    }, [featuredReviews]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const cardVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100
            }
        }
    }

    return (
        <section className="py-20 relative overflow-hidden" ref={ref}>
            {/* Background elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-700/10 rounded-full filter blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-700/10 rounded-full filter blur-3xl" />
            </div>

            {/* Animated grid lines */}
            <div className="absolute inset-0 -z-10 opacity-5">
                <div className="h-full w-full border-[0.5px] border-indigo-500/50 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]" style={{ backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, rgb(99 102 241 / 10%) 1px, transparent 1px), linear-gradient(to bottom, rgb(99 102 241 / 10%) 1px, transparent 1px)' }} />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={controls}
                    variants={{
                        visible: { opacity: 1, y: 0 },
                        hidden: { opacity: 0, y: 20 }
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-indigo-100/10 text-indigo-300 border border-indigo-400/30 mb-4">
                        Success Stories
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
                        Voices of Our AI Community
                    </h2>
                    <div className="max-w-2xl mx-auto">
                        <p className="text-lg text-gray-600 dark:text-gray-300 relative">
                            <span className="relative z-10">Discover how our AI curriculum is empowering professionals to break new ground in machine learning and artificial intelligence.</span>
                            <span className="absolute -z-10 bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-indigo-400/20 rounded-full blur-sm"></span>
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="grid gap-8 md:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                >
                    {displayReviews.map((review) => (
                        <motion.div
                            key={review.id}
                            className="relative rounded-2xl overflow-hidden group"
                            variants={cardVariants}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                        >
                            {/* Gradient border animation */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-70 blur-[2px] group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative rounded-2xl bg-white dark:bg-gray-800/90 backdrop-blur-sm p-6 h-full flex flex-col">
                                {/* Tech circuit pattern */}
                                <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.03] dark:opacity-[0.05]">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10,30 L30,30 L30,10 M70,10 L70,30 L90,30 M90,70 L70,70 L70,90 M30,90 L30,70 L10,70"
                                            fill="none" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M50,30 L50,10 M70,50 L90,50 M50,70 L50,90 M30,50 L10,50"
                                            fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>

                                <div className="flex items-center space-x-1 mb-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <div className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-fit mb-4">
                                    {review.courseType}
                                </div>

                                <blockquote className="flex-grow">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        "{review.content}"
                                    </p>
                                </blockquote>

                                <div className="mt-6 flex items-center">
                                    <div className="flex-shrink-0 relative">
                                        {/* Glowing avatar effect */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-300" />
                                        <img
                                            className="relative h-12 w-12 rounded-full object-cover border-2 border-indigo-500/30"
                                            src={review.author?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
                                            alt={(review.author?.name || review.userName || "User") as string}
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-base font-medium text-gray-900 dark:text-white">
                                            {review.author?.name || review.userName || "Anonymous User"}
                                        </div>
                                        <div className="text-sm text-indigo-600 dark:text-indigo-400">
                                            {review.author?.role || review.userRole || "Course Participant"}
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <svg
                                    className="absolute top-6 right-6 h-10 w-10 text-indigo-200 dark:text-indigo-600/20"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                >
                                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className="mt-14 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={controls}
                    variants={{
                        visible: { opacity: 1, y: 0 },
                        hidden: { opacity: 0, y: 20 }
                    }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <button className="group relative inline-flex items-center justify-center rounded-full px-8 py-3 overflow-hidden bg-indigo-600 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 text-white font-medium transition-all duration-300">
                        <span className="absolute -inset-px rounded-full border-2 border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative flex items-center">
                            View All Success Stories
                            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </button>
                </motion.div>
            </div>
        </section>
    )
}