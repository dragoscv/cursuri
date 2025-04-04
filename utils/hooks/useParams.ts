'use client';

import React from 'react';

/**
 * A custom hook to safely access route parameters in Next.js
 * Unwraps the params object using React.use() before accessing properties
 */
export function useParams<T extends Record<string, string>>(params: T | Promise<T>): T {
    // Unwrap params if it's a Promise using React.use()
    return React.use(params instanceof Promise ? params : Promise.resolve(params));
}

/**
 * A type-safe hook to access specific course params
 */
export function useCourseParams(params: { courseId: string } | Promise<{ courseId: string }>) {
    const unwrappedParams = useParams(params);
    return {
        courseId: unwrappedParams.courseId
    };
}

/**
 * A type-safe hook to access specific lesson params
 */
export function useLessonParams(params: { courseId: string; lessonId: string } | Promise<{ courseId: string; lessonId: string }>) {
    const unwrappedParams = useParams(params);
    return {
        courseId: unwrappedParams.courseId,
        lessonId: unwrappedParams.lessonId
    };
}