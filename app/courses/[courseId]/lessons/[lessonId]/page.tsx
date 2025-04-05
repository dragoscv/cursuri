'use client'

import React, { useContext, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Spinner, Card } from "@heroui/react";
import { useCourseParams } from '@/utils/hooks/useParams';
import LessonContent from '@/components/Lesson/LessonContent';
import LessonNavigation from '@/components/Lesson/Navigation/LessonNavigation';

interface LessonDetailPageProps {
    params: {
        courseId: string;
        lessonId: string;
    };
}

export default function LessonDetailPage({ params }: LessonDetailPageProps) {
    const { courseId, lessonId } = useCourseParams(params);
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('LessonDetailPage must be used within an AppContextProvider');
    }

    const { courses, lessons, user, userPurchases } = context;

    // Check if the course and lesson exist
    const course = courses[courseId];

    // Early return if loading course or lessons
    if (!course || !lessons[courseId]) {
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
                prevLessonId={previousLesson ? previousLesson.id : null}
                nextLessonId={nextLesson ? nextLesson.id : null}
                isCompleted={lesson.isCompleted || false}
                onNavigateLesson={(lessonId) => window.location.href = `/courses/${courseId}/lessons/${lessonId}`}
                onClose={() => window.location.href = `/courses/${courseId}`}
            />
        </div>
    );
}