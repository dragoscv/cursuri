'use client'

import { useState, useEffect, useRef } from 'react';
import { useCourse } from '@/components/contexts/hooks';

type HeroStats = {
    totalCourses: number;
    totalStudents: number;
    totalReviews: number;
    avgRating: number;
    topTechnologies: string[];
};

// Cache for stats to avoid unnecessary recalculations
let statsCache: {
    data: HeroStats | null;
    timestamp: number;
    signature: string;
} = {
    data: null,
    timestamp: 0,
    signature: ''
};

const CACHE_TIME = 60 * 1000; // 1 minute cache

export const useHeroStats = (): HeroStats => {
    const { courses, userPaidProducts, reviews } = useCourse();

    const [stats, setStats] = useState<HeroStats>({
        totalCourses: 0,
        totalStudents: 0,
        totalReviews: 0,
        avgRating: 0,
        topTechnologies: ['TypeScript', 'React', 'Firebase', 'Node.js', 'Tailwind CSS']
    });

    // Create signature for current data
    const calculateSignature = () => {
        return `${Object.keys(courses).length}_${userPaidProducts.length}_${Object.keys(reviews).length}`;
    };

    // Update stats based on real data
    useEffect(() => {
        // Don't do anything if we don't have courses data
        if (Object.keys(courses).length === 0) return;

        // Check if we can use cached data
        const currentSignature = calculateSignature();
        const now = Date.now();

        if (
            statsCache.data &&
            statsCache.signature === currentSignature &&
            (now - statsCache.timestamp) < CACHE_TIME
        ) {
            setStats(statsCache.data);
            return;
        }
        // Calculate total courses
        const totalCourses = Object.keys(courses).length;

        // Calculate total students (unique users who have purchased courses)
        const uniqueStudents = new Set(userPaidProducts.map((product: any) => product.metadata?.userId || ''));
        const totalStudents = uniqueStudents.size > 0 ? uniqueStudents.size : userPaidProducts.length;

        // Calculate total reviews and average rating
        let reviewCount = 0;
        let ratingSum = 0;

        // Gather all course categories/technologies
        const technologiesMap = new Map();

        Object.keys(reviews).forEach(courseId => {
            const courseReviews = reviews[courseId];
            if (courseReviews) {
                Object.keys(courseReviews).forEach(reviewId => {
                    reviewCount++;
                    const review = courseReviews[reviewId];
                    if (review.rating) {
                        ratingSum += review.rating;
                    }
                });
            }

            // Count technologies mentioned in course
            const course = courses[courseId]; if (course && course.tags) {
                course.tags.forEach((tag: string) => {
                    technologiesMap.set(tag, (technologiesMap.get(tag) || 0) + 1);
                });
            }
        });

        // Get top technologies based on frequency
        const topTechnologies = Array.from(technologiesMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);

        // Default to curated list if not enough data
        const defaultTechnologies = ['TypeScript', 'React', 'Firebase', 'Node.js', 'Tailwind CSS'];
        const finalTechnologies = topTechnologies.length >= 3 ?
            topTechnologies :
            defaultTechnologies; const newStats = {
                totalCourses,
                // If no real data, show a reasonable number
                totalStudents: totalStudents || Math.max(50, totalCourses * 10),
                totalReviews: reviewCount,
                avgRating: reviewCount > 0 ? +(ratingSum / reviewCount).toFixed(1) : 4.8,
                topTechnologies: finalTechnologies
            };

        // Update the cache
        statsCache = {
            data: newStats,
            timestamp: Date.now(),
            signature: currentSignature
        };

        setStats(newStats);
    }, [courses, userPaidProducts, reviews]);

    return stats;
};
