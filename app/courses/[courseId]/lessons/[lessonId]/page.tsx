'use client'

import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { Spinner, Card } from "@heroui/react";
import LessonContent from '@/components/Lesson/LessonContent';
import LessonNavigation from '@/components/Lesson/Navigation/LessonNavigation';
import { useRouter } from 'next/navigation';

// Using the same pattern as CourseDetailPage to fix Next.js 15 params Promise issue
export default function LessonDetailPage({
    params
}: {
    params: { courseId: string; lessonId: string } | Promise<{ courseId: string; lessonId: string }>
}) {
    // Unwrap the params using React.use() to handle both Promise and non-Promise cases
    const unwrappedParams = React.use(params instanceof Promise ? params : Promise.resolve(params));
    const { courseId, lessonId } = unwrappedParams;    // Define a proper interface for the debug state
    interface DebugInfo {
        courseId: string;
        lessonId: string;
        courseExists: boolean;
        courseLessonsExist: boolean;
        lessonsAvailable: string[] | string | boolean;
        lessonExists: boolean;
    }

    const context = useContext(AppContext);
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);
    const [debug, setDebug] = useState<DebugInfo>({
        courseId: '',
        lessonId: '',
        courseExists: false,
        courseLessonsExist: false,
        lessonsAvailable: false,
        lessonExists: false
    });

    if (!context) {
        throw new Error('LessonDetailPage must be used within an AppContextProvider');
    }

    const { courses, lessons, user, userPaidProducts, isAdmin, getCourseLessons } = context;

    // Debug information
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

        // If course exists but lessons are not loaded, try to load them
        if (courses && courses[courseId] && (!lessons || !lessons[courseId] || Object.keys(lessons[courseId] || {}).length === 0)) {
            console.log("Debug info - attempting to fetch lessons for course");
            getCourseLessons(courseId);
        }
    }, [courseId, lessonId, courses, lessons, getCourseLessons]);

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
                }                // Update debug information
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
                        <h2 className="text-xl font-semibold mb-4">Course not found</h2>                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The course you&apos;re looking for doesn&apos;t exist or you may not have access to it.
                        </p>
                        <button
                            onClick={() => router.push("/courses")}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Browse Courses
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

    // Get the lesson, handling both array and object formats
    let lesson;
    if (Array.isArray(courseLessons)) {
        lesson = courseLessons.find(l => l.id === lessonId);
    } else {
        lesson = courseLessons[lessonId];
    }

    // Handle case where lesson is not found
    if (!lesson) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-6 shadow-lg">
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold mb-4">Lesson not found</h2>                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The lesson you&apos;re looking for doesn&apos;t exist or you may not have access to it.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push(`/courses/${courseId}`)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                Return to Course
                            </button>

                            {/* Debugging information */}
                            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                                <h3 className="font-bold mb-2">Debugging Information:</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">                                    <li>Course ID: {debug.courseId}</li>
                                    <li>Lesson ID: {debug.lessonId}</li>                                    <li>Course Exists: {debug.courseExists ? 'Yes' : 'No'}</li>
                                    <li>Course Lessons Loaded: {debug.courseLessonsExist ? 'Yes' : 'No'}</li>
                                    <li>Lessons Available: {debug.lessonsAvailable ? 'Yes' : 'No'}</li>
                                    <li>Lesson Exists: {debug.lessonExists ? 'Yes' : 'No'}</li>
                                </ul>
                                <div className="mt-2">
                                    <button
                                        onClick={() => getCourseLessons(courseId)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                    >
                                        Retry Loading Lessons
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
                        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You need to enroll in this course to access this lesson.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.push(`/courses/${courseId}`)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                Go to Course
                            </button>
                            {!user && (
                                <button
                                    onClick={() => router.push("/login")}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Log In
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
            <LessonContent lesson={lesson} />

            <LessonNavigation
                prevLessonId={previousLesson ? previousLesson.id : null}
                nextLessonId={nextLesson ? nextLesson.id : null}
                isCompleted={lesson.isCompleted || false}
                onNavigateLesson={(lessonId) => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
                onClose={() => router.push(`/courses/${courseId}`)}
            />
        </div>
    );
}