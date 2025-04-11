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

/**
 * Custom hook to access authentication-related data from AppContext
 * This hook provides access to the user object, authentication state,
 * and admin status from the global AppContext.
 */
export const useAuth = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useAuth must be used within an AppContextProvider');
    }

    const { user, authLoading, isAdmin } = context;

    return {
        user,
        authLoading,
        isAdmin
    };
};

/**
 * Custom hook to access modal functionality from AppContext
 * This hook provides methods to open, close, and update modals
 * from the global AppContext.
 */
export const useModal = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useModal must be used within an AppContextProvider');
    }

    const { openModal, closeModal, updateModal } = context;

    return {
        openModal,
        closeModal,
        updateModal
    };
};
