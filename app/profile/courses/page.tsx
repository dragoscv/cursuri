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
                // Calculate progress
                const courseLessonsCount = Object.keys(lessonProgress[courseId] || {}).length;
                const completedLessonsCount = Object.values(lessonProgress[courseId] || {}).filter(
                    (progress) => progress.isCompleted
                ).length;

                const progress =
                    courseLessonsCount > 0
                        ? Math.round((completedLessonsCount / courseLessonsCount) * 100)
                        : 0;

                // Get the most recent lesson with progress
                let recentLessonId = '';
                let recentTimestamp = 0;

                if (lessonProgress[courseId]) {
                    Object.entries(lessonProgress[courseId]).forEach(([lessonId, lessonData]) => {
                        // Convert the lastUpdated field to a timestamp for comparison
                        let timestamp = 0;
                        if (typeof lessonData.lastUpdated === 'string') {
                            timestamp = new Date(lessonData.lastUpdated).getTime();
                        } else if (lessonData.lastUpdated && typeof lessonData.lastUpdated === 'object') {
                            if ('seconds' in lessonData.lastUpdated) {
                                // Handle Firestore Timestamp
                                timestamp = lessonData.lastUpdated.seconds * 1000;
                            } else if (lessonData.lastUpdated instanceof Date) {
                                timestamp = lessonData.lastUpdated.getTime();
                            }
                        }

                        if (timestamp > recentTimestamp) {
                            recentLessonId = lessonId;
                            recentTimestamp = timestamp;
                        }
                    });
                }

                courseMap.set(courseId, {
                    ...course,
                    courseId,
                    purchaseDate: new Date(product.purchaseDate || Date.now()),
                    progress,
                    completedLessons: completedLessonsCount,
                    totalLessons: courseLessonsCount,
                    recentLessonId,
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
            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    My Courses
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Access your enrolled courses and track your learning progress.
                </p>
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
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    {searchTerm || filterStatus !== 'all' ? (
                        <>
                            <FiSearch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {t('courses.emptyStates.noMatchingCourses')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {t('courses.emptyStates.noMatchingCoursesDesc')}
                            </p>
                            <Button
                                color="primary"
                                variant="light"
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
                            {' '}
                            <FiBook className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {t('courses.emptyStates.noEnrolledCourses')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {t('courses.emptyStates.noEnrolledCoursesDesc')}
                            </p>
                            <Link href="/courses">
                                <Button color="primary">{t('courses.emptyStates.browseCourses')}</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
