'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FiBook, FiSearch } from '@/components/icons/FeatherIcons';
import CourseCard from '@/components/Profile/CourseCard';
import ProfileCoursesFilter from '@/components/Profile/ProfileCoursesFilter';

export default function ProfileCourses() {
    const t = useTranslations('profile');
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('AppContext not found');
    }
    const { user, courses, userPaidProducts, lessonProgress } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, in-progress, completed

    useEffect(() => {
        if (!userPaidProducts || !courses) {
            setFilteredCourses([]);
            return;
        } // Create enhanced course objects with progress info
        // First, group purchases by courseId to avoid duplicates
        const courseMap = new Map();

        userPaidProducts.forEach((product) => {
            const courseId = product.metadata?.courseId;
            if (!courseId) return;

            const course = courses[courseId];
            if (!course) return;

            // If this course is already in our map, update only if this purchase is more recent
            if (courseMap.has(courseId)) {
                const existingEntry = courseMap.get(courseId);
                const currentPurchaseDate = new Date(product.purchaseDate || Date.now());

                if (currentPurchaseDate > existingEntry.purchaseDate) {
                    courseMap.set(courseId, {
                        ...existingEntry,
                        purchaseDate: currentPurchaseDate,
                    });
                }
            } else {
                // Calculate progress - use lessons for total count, lessonProgress for completed
                const courseLessons = context.lessons?.[courseId] || {};
                const totalCourseLessons = Object.keys(courseLessons).length;
                const completedLessonsCount = Object.values(lessonProgress[courseId] || {}).filter(
                    (progress) => progress.isCompleted
                ).length;

                const progress =
                    totalCourseLessons > 0
                        ? Math.round((completedLessonsCount / totalCourseLessons) * 100)
                        : 0;

                // Get the first incomplete lesson, or fall back to most recent if all completed
                let nextLessonId = '';

                // Sort lessons by order property to get the correct sequence
                const lessonEntries = Object.entries(courseLessons).sort((a, b) => {
                    const orderA = a[1]?.order ?? 999999;
                    const orderB = b[1]?.order ?? 999999;
                    return orderA - orderB;
                });

                // Find the first incomplete lesson in the correct order
                for (const [lessonId, lesson] of lessonEntries) {
                    const lessonProgressData = lessonProgress[courseId]?.[lessonId];
                    if (!lessonProgressData || !lessonProgressData.isCompleted) {
                        nextLessonId = lessonId;
                        break;
                    }
                }

                // If all lessons are completed or no progress exists, use the first lesson (by order)
                if (!nextLessonId && lessonEntries.length > 0) {
                    nextLessonId = lessonEntries[0][0];
                }

                courseMap.set(courseId, {
                    ...course,
                    courseId,
                    purchaseDate: new Date(product.purchaseDate || Date.now()),
                    progress,
                    completedLessons: completedLessonsCount,
                    totalLessons: totalCourseLessons,
                    recentLessonId: nextLessonId,
                    status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started',
                });
            }
        }); // Convert the Map back to an array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enhancedCourses = Array.from(courseMap.values()) as any[];

        // Apply filters
        let filtered = enhancedCourses;

        // Apply search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((course) => {
                if (!course) return false;
                return (
                    course.name.toLowerCase().includes(term) ||
                    (course.description && course.description.toLowerCase().includes(term))
                );
            });
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter((course) => course?.status === filterStatus);
        }

        // Sort by most recent purchase
        filtered.sort((a, b) => {
            if (!a || !b) return 0;
            return b.purchaseDate.getTime() - a.purchaseDate.getTime();
        });

        setFilteredCourses(filtered);
    }, [userPaidProducts, courses, lessonProgress, searchTerm, filterStatus]);

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/5 to-transparent py-6 px-6 rounded-xl border border-[color:var(--ai-card-border)] backdrop-blur-sm shadow-md">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--ai-foreground)] mb-2">
                        {t('nav.myCourses')}
                    </h1>
                    <p className="text-[color:var(--ai-muted)]">
                        {t('courses.description')}
                    </p>
                </div>
            </div>

            {/* Filters and search */}
            <ProfileCoursesFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
            />

            {/* Course List */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.courseId} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)] shadow-md">
                    {searchTerm || filterStatus !== 'all' ? (
                        <>
                            <div className="w-16 h-16 mx-auto bg-[color:var(--ai-primary)]/10 rounded-full flex items-center justify-center mb-4">
                                <FiSearch className="w-8 h-8 text-[color:var(--ai-primary)]" />
                            </div>
                            <h3 className="text-lg font-medium text-[color:var(--ai-foreground)] mb-2">
                                {t('courses.emptyStates.noMatchingCourses')}
                            </h3>
                            <p className="text-[color:var(--ai-muted)] mb-4">
                                {t('courses.emptyStates.noMatchingCoursesDesc')}
                            </p>
                            <Button
                                color="primary"
                                variant="light"
                                radius="lg"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                            >
                                {t('courses.emptyStates.clearFilters')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 mx-auto bg-[color:var(--ai-primary)]/10 rounded-full flex items-center justify-center mb-4">
                                <FiBook className="w-8 h-8 text-[color:var(--ai-primary)]" />
                            </div>
                            <h3 className="text-lg font-medium text-[color:var(--ai-foreground)] mb-2">
                                {t('courses.emptyStates.noEnrolledCourses')}
                            </h3>
                            <p className="text-[color:var(--ai-muted)] mb-4">
                                {t('courses.emptyStates.noEnrolledCoursesDesc')}
                            </p>
                            <Button as={Link} href="/courses" color="primary" radius="lg">
                                {t('courses.emptyStates.browseCourses')}
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
