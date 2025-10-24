'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('lessons.wrapper');
    const { courseId, lessonId } = params;
    const context = useContext(AppContext);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [lesson, setLesson] = useState<LessonType | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [accessCheckComplete, setAccessCheckComplete] = useState(false);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        const fetchData = async () => {
            if (!context) {
                console.log('No context available yet');
                return;
            }

            if (!mounted) return;

            try {
                setIsLoading(true);
                const { courses, lessons, fetchCourseById, getCourseLessons } = context;

                console.log('[ClientLessonWrapper] Fetching lesson data:', { courseId, lessonId });

                // First, ensure the course is loaded
                let currentCourse = courses?.[courseId];
                if (!currentCourse) {
                    console.log('[ClientLessonWrapper] Course not in context, fetching...');
                    if (fetchCourseById) {
                        await fetchCourseById(courseId);
                        // Wait for state to update
                        await new Promise(resolve => { timeoutId = setTimeout(resolve, 100); });
                        if (!mounted) return;
                        currentCourse = context.courses?.[courseId];
                    }
                }

                if (!currentCourse) {
                    console.warn('[ClientLessonWrapper] Could not load course');
                    if (mounted) {
                        setError('Course not found');
                        setIsLoading(false);
                    }
                    return;
                }

                if (mounted) {
                    setCourse(currentCourse);
                    console.log('[ClientLessonWrapper] Course loaded:', currentCourse.name);
                }

                // Now ensure lessons are loaded for this course
                let currentLesson: LessonType | null = null;

                // Check if lessons are already in context
                if (lessons[courseId] && lessons[courseId][lessonId]) {
                    currentLesson = lessons[courseId][lessonId] as LessonType;
                    console.log('[ClientLessonWrapper] Lesson found in context');
                } else {
                    // Lessons not loaded yet, fetch them
                    console.log('[ClientLessonWrapper] Lessons not in context, fetching...');
                    if (getCourseLessons) {
                        await getCourseLessons(courseId);
                        // Wait for state to update with a longer timeout
                        await new Promise(resolve => { timeoutId = setTimeout(resolve, 1000); });
                        if (!mounted) return;

                        // Check again after fetching
                        if (context.lessons[courseId] && context.lessons[courseId][lessonId]) {
                            currentLesson = context.lessons[courseId][lessonId] as LessonType;
                            console.log('[ClientLessonWrapper] Lesson found after fetching');
                        } else {
                            console.warn('[ClientLessonWrapper] Lesson not found after fetching');
                            console.log('[ClientLessonWrapper] Available lessons:',
                                context.lessons[courseId] ? Object.keys(context.lessons[courseId]) : 'none');
                        }
                    }
                }

                if (mounted) {
                    if (currentLesson) {
                        setLesson(currentLesson);
                        setError(null);
                        
                        // CHECK ACCESS CONTROL
                        // User has access if:
                        // 1. Lesson is marked as free
                        // 2. User is admin
                        // 3. User is authenticated AND has purchased the course
                        const user = context.user;
                        const isAdmin = context.isAdmin;
                        const userCourseAccess = context.userCourseAccess;
                        
                        console.log('[ClientLessonWrapper] Access check:', {
                            lessonId,
                            isFree: currentLesson.isFree,
                            isAdmin,
                            isAuthenticated: !!user,
                            hasCoursePurchase: userCourseAccess?.[courseId]
                        });
                        
                        if (currentLesson.isFree) {
                            setHasAccess(true);
                        } else if (isAdmin) {
                            setHasAccess(true);
                        } else if (user && userCourseAccess && userCourseAccess[courseId]) {
                            setHasAccess(true);
                        } else {
                            setHasAccess(false);
                        }
                        
                        setAccessCheckComplete(true);
                    } else {
                        console.warn('[ClientLessonWrapper] Lesson not found:', { courseId, lessonId });
                        setError('Lesson not found or you may not have access to it');
                        setAccessCheckComplete(true);
                    }
                    setIsLoading(false);
                }
            } catch (error) {
                console.warn('[ClientLessonWrapper] Error loading lesson:', error);
                if (mounted) {
                    setError('Error loading lesson');
                    setIsLoading(false);
                    setAccessCheckComplete(true);
                }
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            mounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [context, courseId, lessonId]);

    // Return loading state while we fetch the data
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-[color:var(--ai-muted)]">{t('loadingContent')}</p>
            </div>
        );
    }

    // If we have an error, show error message with detailed debugging
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold mb-4">{t('errorLoading')}</h1>
                <p className="mb-6 text-[color:var(--ai-muted)]">{error}</p>

                {/* Debugging information */}
                {context && (
                    <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-2xl w-full">
                        <h3 className="font-bold mb-2 text-sm">{t('debugInfo')}</h3>
                        <div className="space-y-1 text-xs font-mono">
                            <div>
                                <strong>{t('requestedLessonId')}</strong> {lessonId}
                            </div>
                            <div>
                                <strong>{t('courseId')}</strong> {courseId}
                            </div>
                            <div>
                                <strong>{t('courseLoaded')}</strong> {course ? t('yes') : t('no')}
                            </div>
                            {course && (
                                <div>
                                    <strong>{t('courseName')}</strong> {course.name}
                                </div>
                            )}
                            <div>
                                <strong>{t('lessonsLoaded')}</strong> {context.lessons[courseId] ? t('yes') : t('no')}
                            </div>
                            {context.lessons[courseId] && (
                                <>
                                    <div>
                                        <strong>{t('availableLessonCount')}</strong> {Object.keys(context.lessons[courseId]).length}
                                    </div>
                                    <div>
                                        <strong>{t('availableLessonIds')}</strong>
                                        <div className="pl-4 mt-1 max-h-40 overflow-y-auto">
                                            {Object.keys(context.lessons[courseId]).map(id => (
                                                <div key={id} className={id === lessonId ? 'text-green-600 font-bold' : ''}>
                                                    {id} {id === lessonId && '← (Requested)'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t('returnToCourse')}
                </button>
            </div>
        );
    }

    // If we have a lesson, render it
    if (lesson && course && accessCheckComplete) {
        // Check access before rendering content
        if (!hasAccess && !lesson.isFree) {
            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            <div className="mb-6">
                                <svg className="mx-auto h-16 w-16 text-[color:var(--ai-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-[color:var(--ai-foreground)]">
                                {t('accessDenied')}
                            </h2>
                            <p className="text-[color:var(--ai-muted)] mb-6 max-w-md mx-auto">
                                {t('accessDeniedDesc')}
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap">
                                <button
                                    onClick={() => router.push(`/courses/${courseId}`)}
                                    className="px-6 py-3 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    {t('viewCourse')}
                                </button>
                                {!context?.user && (
                                    <button
                                        onClick={() => router.push('/')}
                                        className="px-6 py-3 bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)] rounded-lg font-medium hover:bg-[color:var(--ai-card-bg)]/80 transition-all duration-300"
                                    >
                                        {t('signIn')}
                                    </button>
                                )}
                            </div>
                            <div className="mt-6 text-sm text-[color:var(--ai-muted)]">
                                <p>{t('needHelp')} <a href="/contact" className="text-[color:var(--ai-primary)] hover:underline">{t('contactUs')}</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return <LessonContent
            lesson={lesson}
            course={course}
            onClose={() => router.push(`/courses/${courseId}`)}
            onNavigateLesson={(newLessonId) => router.push(`/courses/${courseId}/lessons/${newLessonId}`)}
        />;
    }

    // Otherwise show a generic message (shouldn't reach here normally)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-[color:var(--ai-muted)]">{t('loadingContent')}</p>
        </div>
    );
}