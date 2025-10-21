'use client'

import React, { useContext, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { Spinner, Card } from "@heroui/react";
import LessonContent from '@/components/Lesson/LessonContent';
import LessonViewer from '@/components/Lesson/LessonViewer';
import { useRouter } from 'next/navigation';

interface DebugInfo {
    courseId: string;
    lessonId: string;
    courseExists: boolean;
    courseLessonsExist: boolean;
    lessonsAvailable: string[] | string | boolean;
    lessonExists: boolean;
}

export default function LessonDetailComponent({
    params
}: {
    params: { courseId: string; lessonId: string }
}) {
    const t = useTranslations('lessons.detail');
    const tCommon = useTranslations('common');

    // Validate params at component level
    if (!params || typeof params.courseId !== 'string' || typeof params.lessonId !== 'string') {
        console.error("Invalid params in LessonDetailComponent:", params);
        return <div className="p-8 text-center">Error: Invalid lesson parameters</div>;
    }

    // Extract courseId and lessonId, ensure they're strings
    const courseId = params.courseId;
    const lessonId = params.lessonId;

    const context = useContext(AppContext);
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);
    const [useNewViewer, setUseNewViewer] = useState(false);
    const [debug, setDebug] = useState<DebugInfo>({
        courseId: '',
        lessonId: '',
        courseExists: false,
        courseLessonsExist: false,
        lessonsAvailable: false,
        lessonExists: false
    });

    if (!context) {
        throw new Error('LessonDetailComponent must be used within an AppContextProvider');
    }

    const { courses, lessons, user, userPaidProducts, isAdmin, getCourseLessons } = context;    // Debug information
    useEffect(() => {
        console.log("Debug info - courseId:", courseId);
        console.log("Debug info - lessonId:", lessonId);
        console.log("Debug info - course exists:", Boolean(courses[courseId]));
        console.log("Debug info - courseLessons exists:", Boolean(lessons[courseId]));

        // Store debug info for rendering
        setDebug({
            courseId,
            lessonId,
            courseExists: Boolean(courses[courseId]),
            courseLessonsExist: Boolean(lessons[courseId]),
            // Store whether lessons are available (true) or not (false)
            lessonsAvailable: Boolean(lessons && lessons[courseId] &&
                (Array.isArray(lessons[courseId])
                    ? lessons[courseId].length > 0
                    : Object.keys(lessons[courseId]).length > 0)),
            lessonExists: false // Will be updated below
        });
    }, [courseId, lessonId, courses, lessons]);

    // Separate useEffect to fetch lessons - this prevents the infinite loop
    useEffect(() => {
        // Only fetch lessons if they don't exist yet
        if (courseId &&
            courses &&
            courses[courseId] &&
            (!lessons || !lessons[courseId] || Object.keys(lessons[courseId] || {}).length === 0)) {
            console.log("Debug info - attempting to fetch lessons for course:", courseId);
            getCourseLessons(courseId);
        } else {
            console.log("Debug info - not fetching lessons:", {
                courseId: courseId,
                courseExists: Boolean(courses && courses[courseId]),
                lessonsExist: Boolean(lessons && lessons[courseId])
            });
        }
    }, [courseId, courses, getCourseLessons]);

    // Check if the course exists
    const course = courses[courseId];
    const courseLessons = lessons[courseId];

    // Check if user has access to this course
    useEffect(() => {
        // Only run this check when we have the necessary data
        if (courseId && course) {
            // First determine if the lesson exists
            let lessonExists = false;
            let lesson = null;

            if (courseLessons) {
                if (Array.isArray(courseLessons)) {
                    // If courseLessons is an array, find the lesson by id
                    lesson = courseLessons.find(l => l.id === lessonId);
                    lessonExists = Boolean(lesson);
                } else {
                    // If courseLessons is an object, check if the lessonId exists as a key
                    lessonExists = Boolean(courseLessons[lessonId]);
                    lesson = courseLessons[lessonId];
                }

                // Update debug information
                setDebug((prev: DebugInfo) => ({
                    ...prev,
                    lessonExists
                }));
            }

            // User is an admin - always has access
            if (isAdmin) {
                setHasAccess(true);
                return;
            }

            // Check if the course is free
            if (course.isFree) {
                setHasAccess(true);
                return;
            }

            // Check if the lesson is free (if lesson is loaded)
            if (lesson && lesson.isFree) {
                setHasAccess(true);
                return;
            }

            // Check if user has purchased the course (via Stripe payments)
            if (user && userPaidProducts) {
                const hasPurchased = userPaidProducts.some(product =>
                    product.metadata?.courseId === courseId
                );

                if (hasPurchased) {
                    setHasAccess(true);
                    return;
                }
            }

            // If no access conditions are met, user doesn't have access
            setHasAccess(false);
        }
    }, [courseId, course, courseLessons, lessonId, isAdmin, user, userPaidProducts]);

    // If course doesn't exist, show error
    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">{t('courseNotFound')}</h2>
                        <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mb-6">
                            {t('courseNotFoundDesc')}
                        </p>
                        <button
                            onClick={() => router.push("/courses")}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            {t('browseCourses')}
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    // If lessons aren't loaded yet, show loading state
    if (!courseLessons) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">{t('loadingCourseContent')}</h2>
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-20 h-20 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded-full mb-4"></div>
                            <div className="h-4 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded w-1/3"></div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }    // Get the lesson, handling both array and object formats
    let lesson;
    if (Array.isArray(courseLessons)) {
        console.log(`Looking for lesson ${lessonId} in array of ${courseLessons.length} lessons`);
        lesson = courseLessons.find(l => l.id === lessonId);
        if (!lesson) {
            console.log(`Lesson ${lessonId} not found in array. Available lessons:`,
                courseLessons.map(l => ({ id: l.id, name: l.name })));
        }
    } else {
        console.log(`Looking for lesson ${lessonId} in object with keys:`, Object.keys(courseLessons));
        lesson = courseLessons[lessonId];
        if (!lesson) {
            console.log(`Lesson ${lessonId} not found in object`);
        }
    }    // Handle case where lesson is not found
    if (!lesson) {
        // If we should use the new viewer component for better error handling
        if (useNewViewer) {
            return (
                <div className="container mx-auto px-4 py-8">
                    <LessonViewer courseId={courseId} lessonId={lessonId} />
                </div>
            );
        }

        // Fallback to traditional error UI
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">{t('lessonNotFound')}</h2>
                        <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mb-6">
                            {t('lessonNotFoundDesc')}
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push(`/courses/${courseId}`)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                {t('returnToCourse')}
                            </button>

                            {/* Try the new viewer component button */}
                            <button
                                onClick={() => setUseNewViewer(true)}
                                className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                {t('tryAlternativeLoader')}
                            </button>

                            {/* Debugging information */}
                            <div className="mt-6 p-4 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded-lg text-left">
                                <h3 className="font-bold mb-2">{t('debuggingInfo')}</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>{t('courseId')} {debug.courseId}</li>
                                    <li>{t('lessonId')} {debug.lessonId}</li>
                                    <li>{t('courseExists')} {debug.courseExists ? t('yes') : t('no')}</li>
                                    <li>{t('courseLessonsLoaded')} {debug.courseLessonsExist ? t('yes') : t('no')}</li>
                                    <li>{t('lessonsAvailable')} {debug.lessonsAvailable ? t('yes') : t('no')}</li>
                                    <li>{t('lessonExists')} {debug.lessonExists ? t('yes') : t('no')}</li>
                                </ul>
                                <div className="mt-2">
                                    <button
                                        onClick={() => getCourseLessons(courseId)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                    >
                                        {t('retryLoadingLessons')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Check if user has access to view this lesson
    if (!hasAccess && !lesson.isFree && !isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">{t('accessDenied')}</h2>
                        <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mb-6">
                            {t('accessDeniedDesc')}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.push(`/courses/${courseId}`)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                {t('goToCourse')}
                            </button>
                            {!user && (
                                <button
                                    onClick={() => router.push("/login")}
                                    className="px-4 py-2 bg-[color:var(--ai-muted)] hover:bg-[color:var(--ai-muted-foreground)] text-white rounded-lg transition-colors"
                                >
                                    {t('logIn')}
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // For navigation, we need ordered lessons
    let sortedLessons = [];
    if (courseLessons) {
        if (Array.isArray(courseLessons)) {
            sortedLessons = [...courseLessons].sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });
        } else {
            sortedLessons = Object.values(courseLessons).sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });
        }
    }

    // Find current lesson index in the sorted array
    const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);

    // Get previous and next lessons based on the sorted order
    const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <LessonContent
                lesson={lesson}
                prevLessonId={previousLesson ? previousLesson.id : null}
                nextLessonId={nextLesson ? nextLesson.id : null}
                onNavigateLesson={(lessonId) => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
                onClose={() => router.push(`/courses/${courseId}`)}
            />
        </div>
    );
}
