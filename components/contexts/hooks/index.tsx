'use client'

import { useContext } from 'react';
import { AppContext } from '@/components/AppContext';

/**
 * Custom hook to access course-related data from AppContext
 * This hook provides a convenient way to access course data, user purchases, 
 * and other course-related state from the global AppContext.
 */
export const useCourse = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useCourse must be used within an AppContextProvider');
    }

    const {
        courses,
        products,
        lessons,
        userPaidProducts,
        reviews,
        getCourseLessons,
        getCourseReviews,
        lessonProgress,
        saveLessonProgress,
        markLessonComplete
    } = context;

    return {
        courses,
        products,
        lessons,
        userPaidProducts,
        reviews,
        getCourseLessons,
        getCourseReviews,
        lessonProgress,
        saveLessonProgress,
        markLessonComplete
    };
};

/**
 * Hook for accessing and managing course lessons
 */
export const useLessons = (courseId: string) => {
    const { lessons, getCourseLessons } = useCourse();

    // Get all lessons for this specific course
    const courseLessons = lessons[courseId] || {};

    // Helper function to load lessons if needed
    const loadLessons = async () => {
        if (!Object.keys(courseLessons).length) {
            return getCourseLessons(courseId);
        }
        return () => { }; // Return no-op if lessons are already loaded
    };

    return {
        lessons: courseLessons,
        loadLessons
    };
};
