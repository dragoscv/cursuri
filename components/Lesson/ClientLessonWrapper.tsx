'use client';

import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
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

type AccessReason = 'free' | 'admin' | 'purchased' | 'subscription' | 'denied' | 'pending';

const LESSON_LOAD_TIMEOUT_MS = 12000;

export default function ClientLessonWrapper({ params }: ClientLessonWrapperProps) {
    const t = useTranslations('lessons.wrapper');
    const { courseId, lessonId } = params;
    const context = useContext(AppContext);
    const router = useRouter();

    // Trigger fetches at most once per (courseId, lessonId) combo
    const courseFetchRef = useRef<string | null>(null);
    const lessonsFetchRef = useRef<string | null>(null);

    const [timedOut, setTimedOut] = useState(false);

    // Derive state from context on every render — no race conditions
    const course = (context?.courses?.[courseId] || null) as Course | null;
    const lesson = (context?.lessons?.[courseId]?.[lessonId] || null) as LessonType | null;
    const lessonsForCourse = context?.lessons?.[courseId];
    const lessonsLoaded = !!lessonsForCourse; // even an empty {} means we've loaded

    // Trigger course fetch once when missing
    useEffect(() => {
        if (!context) return;
        if (course) return;
        if (courseFetchRef.current === courseId) return;
        courseFetchRef.current = courseId;
        void context.fetchCourseById?.(courseId);
    }, [context, course, courseId]);

    // Trigger lessons fetch once per course when missing
    useEffect(() => {
        if (!context) return;
        if (!course) return; // wait until course exists
        if (lessonsLoaded && lesson) return; // already have what we need
        if (lessonsFetchRef.current === courseId) return;
        lessonsFetchRef.current = courseId;
        void context.getCourseLessons?.(courseId);
    }, [context, course, courseId, lessonsLoaded, lesson]);

    // Reset fetch refs when navigating to a different lesson/course
    useEffect(() => {
        return () => {
            // On unmount, allow refetch on next visit
            courseFetchRef.current = null;
            lessonsFetchRef.current = null;
        };
    }, [courseId, lessonId]);

    // Safety timeout to surface an error if data never arrives
    useEffect(() => {
        if (lesson || (lessonsLoaded && course)) {
            setTimedOut(false);
            return;
        }
        const id = setTimeout(() => setTimedOut(true), LESSON_LOAD_TIMEOUT_MS);
        return () => clearTimeout(id);
    }, [lesson, lessonsLoaded, course]);

    // Compute access (memoized; cheap)
    const accessReason: AccessReason = useMemo(() => {
        if (!lesson || !context) return 'pending';
        if (lesson.isFree) return 'free';
        if (context.isAdmin) return 'admin';
        const user = context.user;
        if (user && context.userCourseAccess?.[courseId]) return 'purchased';
        if (user && context.subscriptions && context.subscriptions.length > 0) return 'subscription';
        return 'denied';
    }, [lesson, context, courseId]);

    // Sibling lesson IDs (memoized)
    const { prevLessonId, nextLessonId } = useMemo(() => {
        if (!lessonsForCourse) return { prevLessonId: null, nextLessonId: null };
        const list = (Object.values(lessonsForCourse) as LessonType[])
            .filter((l) => l && l.status === 'active')
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        const idx = list.findIndex((l) => l.id === lessonId);
        return {
            prevLessonId: idx > 0 ? list[idx - 1].id : null,
            nextLessonId: idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null,
        };
    }, [lessonsForCourse, lessonId]);

    // ---- Render branches ----

    if (!context) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    // Course missing after timeout
    if (!course && timedOut) {
        return renderError({
            t,
            title: t('errorLoading'),
            message: 'Course not found',
            onBack: () => router.push('/courses'),
            backLabel: 'Back to courses',
        });
    }

    // Lessons loaded but the requested one isn't there
    if (course && lessonsLoaded && !lesson) {
        if (timedOut || Object.keys(lessonsForCourse || {}).length > 0) {
            return renderError({
                t,
                title: t('errorLoading'),
                message: 'Lesson not found or you may not have access to it',
                onBack: () => router.push(`/courses/${courseId}`),
                backLabel: t('returnToCourse'),
            });
        }
    }

    // Loading state
    if (!lesson || !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-[color:var(--ai-muted)]">{t('loadingContent')}</p>
            </div>
        );
    }

    // Access denied
    if (accessReason === 'denied') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <div className="mb-6">
                            <svg
                                className="mx-auto h-16 w-16 text-[color:var(--ai-danger)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
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
                            {!context.user && (
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-6 py-3 bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)] rounded-lg font-medium hover:bg-[color:var(--ai-card-bg)]/80 transition-all duration-300"
                                >
                                    {t('signIn')}
                                </button>
                            )}
                        </div>
                        <div className="mt-6 text-sm text-[color:var(--ai-muted)]">
                            <p>
                                {t('needHelp')}{' '}
                                <a href="/contact" className="text-[color:var(--ai-primary)] hover:underline">
                                    {t('contactUs')}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render the lesson
    return (
        <LessonContent
            lesson={lesson}
            course={course}
            prevLessonId={prevLessonId}
            nextLessonId={nextLessonId}
            onClose={() => router.push(`/courses/${courseId}`)}
            onNavigateLesson={(newLessonId) =>
                router.push(`/courses/${courseId}/lessons/${newLessonId}`)
            }
        />
    );
}

function renderError({
    title,
    message,
    onBack,
    backLabel,
}: {
    t: any;
    title: string;
    message: string;
    onBack: () => void;
    backLabel: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <p className="mb-6 text-[color:var(--ai-muted)]">{message}</p>
            <button
                onClick={onBack}
                className="px-6 py-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg hover:opacity-90 transition-all duration-300"
            >
                {backLabel}
            </button>
        </div>
    );
}
