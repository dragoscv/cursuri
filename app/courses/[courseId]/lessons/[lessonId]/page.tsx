'use client'

import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../../../../components/AppContext';
import LessonContent from '../../../../../components/Lesson/LessonContent';
import LessonNavigation from '../../../../../components/Lesson/LessonNavigation';
import { useLessonParams } from '@/utils/hooks/useParams';
import { Card } from '@heroui/react';
import { Lesson } from '@/types';

interface LessonDetailPageProps {
    params: {
        courseId: string;
        lessonId: string;
    } | Promise<{
        courseId: string;
        lessonId: string;
    }>
}

export default function LessonDetailPage({ params }: LessonDetailPageProps) {
    // Use the custom hook to safely access params
    const { courseId, lessonId } = useLessonParams(params);
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('LessonDetailPage must be used within an AppContextProvider');
    }

    const { lessons, getCourseLessons } = context;

    // Add effect to fetch lessons for this course if they're not already loaded
    useEffect(() => {
        if (courseId) {
            console.log("Fetching lessons for course:", courseId);
            const unsubscribe = getCourseLessons(courseId);
            return () => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            };
        }
    }, [courseId, getCourseLessons]);

    // Add error handling if lessons or course is not loaded
    if (!lessons || !lessons[courseId]) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">Loading course content...</h2>
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Fix: lessons[courseId] is an object with lesson IDs as keys, not an array
    // Directly access the specific lesson by ID
    const lesson = lessons[courseId]?.[lessonId];
    
    // Handle case where lesson is not found
    if (!lesson) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">Lesson not found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The lesson you're looking for doesn't exist or you may not have access to it.
                        </p>
                        <button 
                            onClick={() => window.history.back()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    // Convert lessons object to array for finding previous and next lessons
    const lessonsArray = Object.values(lessons[courseId]);
    
    // Sort lessons by their order property if available
    const sortedLessons = [...lessonsArray].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });
    
    // Find current lesson index
    const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);
    
    // Get previous and next lessons
    const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <LessonContent lesson={lesson} />

            <LessonNavigation
                courseId={courseId}
                currentLessonId={lessonId}
                previousLesson={previousLesson}
                nextLesson={nextLesson}
            />
        </div>
    );
}