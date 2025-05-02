'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../AppContext';
import LessonContent from './LessonContent';
import { Course, Lesson as LessonType } from '@/types';
import { Spinner } from '@heroui/react';

interface ClientLessonWrapperProps {
    params: {
        courseId: string;
        lessonId: string;
    };
}

export default function ClientLessonWrapper({ params }: ClientLessonWrapperProps) {
    const { courseId, lessonId } = params;
    const context = useContext(AppContext);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [lesson, setLesson] = useState<LessonType | null>(null);
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!context) return;

            try {
                // First check if we have the course and lesson in context already
                const { courses, lessons } = context;

                let currentCourse = courses?.[courseId];
                if (!currentCourse) {
                    // If not in state, manually fetch it
                    console.log('Course not in context state, fetching directly');
                    setIsLoading(true);

                    // You could add a direct fetching mechanism here
                    // For now, we'll redirect to course page if not found
                    router.push(`/courses/${courseId}`);
                    return;
                }

                setCourse(currentCourse);

                // Try getting the lesson from context
                let currentLesson: LessonType | null = null;

                if (lessons[courseId] && lessons[courseId][lessonId]) {
                    currentLesson = lessons[courseId][lessonId] as LessonType;
                } else {
                    // Load lessons for the course if they're not already loaded
                    console.log('Lessons not in context state, initiating load');
                    // You could trigger a fetch here if needed

                    // For now, we'll wait a moment to see if lessons load
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Check again after waiting
                    if (lessons[courseId] && lessons[courseId][lessonId]) {
                        currentLesson = lessons[courseId][lessonId] as LessonType;
                    } else {
                        console.log('Lesson not found after waiting');
                    }
                }

                if (currentLesson) {
                    setLesson(currentLesson);
                } else {
                    console.log('Could not find lesson, redirecting to course');
                    router.push(`/courses/${courseId}`);
                    return;
                }
            } catch (error) {
                console.error('Error loading lesson:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [context, courseId, lessonId, router]);

    // Return loading state while we fetch the data
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-[color:var(--ai-muted)]">Loading lesson...</p>
            </div>
        );
    }    // If we have a lesson, render it
    if (lesson) {
        return <LessonContent
            lesson={lesson}
            course={course || undefined}
            onClose={() => router.push(`/courses/${courseId}`)}
            onNavigateLesson={(lessonId) => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
        />;
    }

    // Otherwise show an error message
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
            <p className="mb-6">The lesson you're looking for doesn't exist or you may not have access to it.</p>
            <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Return to Course
            </button>
        </div>
    );
}