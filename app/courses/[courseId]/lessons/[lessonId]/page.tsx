'use client'

import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../../../components/AppContext';
import LessonContent from '../../../../../components/Lesson/LessonContent';
import LessonNavigation from '../../../../../components/Lesson/LessonNavigation';
import { Lesson } from '@/types';
import { Spinner } from '@heroui/react';
import { useLessonParams } from '@/utils/hooks/useParams';

// Define the props interface for your page component
interface LessonDetailPageProps {
    params: {
        courseId: string;
        lessonId: string;
    }
}

export default function LessonDetailPage(props: LessonDetailPageProps) {
    // Use the custom hook to safely access params
    const { courseId, lessonId } = useLessonParams(props.params);

    const [isLoading, setIsLoading] = useState(true);
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('LessonDetailPage must be used within an AppContextProvider');
    }

    const { lessons, getCourseLessons } = context;
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [previousLesson, setPreviousLesson] = useState<Lesson | null>(null);
    const [nextLesson, setNextLesson] = useState<Lesson | null>(null);

    // Fetch course lessons if not already loaded
    useEffect(() => {
        const loadLessons = async () => {
            setIsLoading(true);

            if (!lessons[courseId]) {
                await getCourseLessons(courseId);
            }

            // Get lessons for this course and sort them by order
            const courseLessons = Object.values(lessons[courseId] || {});
            if (courseLessons.length > 0) {
                const sortedLessons = [...courseLessons].sort((a: Lesson, b: Lesson) => {
                    const orderA = a.order || 0;
                    const orderB = b.order || 0;
                    return orderA - orderB;
                });

                const lessonIndex = sortedLessons.findIndex((l: Lesson) => l.id === lessonId);

                if (lessonIndex !== -1) {
                    setCurrentLesson(sortedLessons[lessonIndex]);
                    setPreviousLesson(lessonIndex > 0 ? sortedLessons[lessonIndex - 1] : null);
                    setNextLesson(lessonIndex < sortedLessons.length - 1 ? sortedLessons[lessonIndex + 1] : null);
                }
            }

            setIsLoading(false);
        };

        loadLessons();
    }, [courseId, lessonId, lessons, getCourseLessons]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (!currentLesson) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
                        Lesson not found
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        The requested lesson could not be loaded.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <LessonContent lesson={currentLesson} />

            <LessonNavigation
                courseId={courseId}
                currentLessonId={lessonId}
                previousLesson={previousLesson}
                nextLesson={nextLesson}
            />
        </div>
    );
}