'use client'

import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiBook, FiBarChart2, FiClock, FiAward } from '@/components/icons/FeatherIcons';
import Link from 'next/link';
import StatsCard from '@/components/Profile/StatsCard';
import DashboardProgress from '@/components/Profile/DashboardProgress';
import RecentActivity from '@/components/Profile/RecentActivity';
import ProfileHeader from '@/components/Profile/ProfileHeader';

export default function ProfileDashboard() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, courses, userPaidProducts, lessonProgress, reviews } = context;
    const [stats, setStats] = useState({
        totalCoursesEnrolled: 0,
        completedCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        totalHours: 0,
        recentActivity: [] as {
            type: string;
            courseId: string;
            lessonId?: string;
            courseName: string;
            lessonName?: string;
            date: Date;
        }[]
    });

    // Process user data to get statistics
    useEffect(() => {
        if (!user || !userPaidProducts || !courses) return;

        let totalLessons = 0;
        let completedLessons = 0;
        let totalHours = 0;
        let completedCourses = 0;
        const recentActivity: typeof stats.recentActivity = [];

        // Process each purchased course
        userPaidProducts.forEach(product => {
            const courseId = product.metadata?.courseId;
            const course = courses[courseId];

            if (course) {
                // Calculate number of lessons
                const courseLessonsCount = Object.keys(lessonProgress[courseId] || {}).length;
                totalLessons += courseLessonsCount;

                // Calculate completed lessons
                const courseCompletedLessons = Object.values(lessonProgress[courseId] || {})
                    .filter(progress => progress.isCompleted).length;
                completedLessons += courseCompletedLessons;

                // Check if course is completed
                if (courseLessonsCount > 0 && courseCompletedLessons === courseLessonsCount) {
                    completedCourses++;
                }

                // Add course duration to total hours (if available)
                if (course.duration) {
                    const durationMatch = course.duration.match(/(\d+)/);
                    if (durationMatch) {
                        totalHours += parseInt(durationMatch[1]);
                    }
                }

                // Add activities for lessons with progress
                if (lessonProgress[courseId]) {
                    Object.entries(lessonProgress[courseId]).forEach(([lessonId, progress]) => {
                        // Only add activities with a valid timestamp
                        if (progress.lastUpdated) {
                            let timestamp;
                            if (typeof progress.lastUpdated === 'string') {
                                timestamp = progress.lastUpdated;
                            } else if ('seconds' in progress.lastUpdated) {
                                // Handle Firestore Timestamp
                                timestamp = new Date(progress.lastUpdated.seconds * 1000);
                            } else {
                                timestamp = progress.lastUpdated;
                            }

                            recentActivity.push({
                                type: 'lesson_progress',
                                courseId,
                                lessonId,
                                courseName: course.name,
                                lessonName: `Lesson ${lessonId}`,
                                date: new Date(timestamp)
                            });
                        }
                    });
                }
            }
        });

        // Sort activities by date (most recent first)
        recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Update stats state
        setStats({
            totalCoursesEnrolled: userPaidProducts.length,
            completedCourses,
            totalLessons,
            completedLessons,
            totalHours,
            recentActivity: recentActivity.slice(0, 5) // Only keep the 5 most recent activities
        });
    }, [user, courses, userPaidProducts, lessonProgress, reviews]);

    // Calculate progress percentage
    const lessonCompletionPercentage = stats.totalLessons > 0
        ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
        : 0;

    const courseCompletionPercentage = stats.totalCoursesEnrolled > 0
        ? Math.round((stats.completedCourses / stats.totalCoursesEnrolled) * 100)
        : 0;

    if (!user) {
        return null;
    }

    return (
        <>
            <ProfileHeader
                title="Your Learning Dashboard"
                description="Track your progress, view statistics, and continue learning."
            />

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={<FiBook className="text-[color:var(--ai-primary)]" />}
                    title="Enrolled Courses"
                    value={stats.totalCoursesEnrolled}
                    footer={`${stats.completedCourses} completed`}
                    colorClass="from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                />
                <StatsCard
                    icon={<FiBarChart2 className="text-[color:var(--ai-success)]" />}
                    title="Lessons Completed"
                    value={stats.completedLessons}
                    footer={`${stats.totalLessons} total`}
                    colorClass="from-[color:var(--ai-success)] to-[color:var(--ai-secondary)]"
                />
                <StatsCard
                    icon={<FiClock className="text-[color:var(--ai-secondary)]" />}
                    title="Learning Hours"
                    value={stats.totalHours}
                    footer="Total hours of content"
                    colorClass="from-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                />
                <StatsCard
                    icon={<FiAward className="text-[color:var(--ai-accent)]" />}
                    title="Achievements"
                    value={stats.completedCourses}
                    footer="Courses mastered"
                    colorClass="from-[color:var(--ai-accent)] to-[color:var(--ai-primary)]"
                />
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardProgress
                    courseCompletionPercentage={courseCompletionPercentage}
                    lessonCompletionPercentage={lessonCompletionPercentage}
                    completedCourses={stats.completedCourses}
                    totalCoursesEnrolled={stats.totalCoursesEnrolled}
                    completedLessons={stats.completedLessons}
                    totalLessons={stats.totalLessons}
                    userPaidProducts={userPaidProducts}
                    courses={courses}
                    lessonProgress={lessonProgress}
                />

                {/* Recent Activity */}
                <RecentActivity activities={stats.recentActivity} />
            </div>

            {/* Continue Learning Button */}
            {userPaidProducts.length > 0 ? (
                <div className="mt-6 text-center">
                    <Link href="/profile/courses">
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium px-8"
                            startContent={<FiBook />}
                            size="lg"
                        >
                            Continue Learning
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="mt-6 text-center">
                    <Link href="/courses">
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium px-8"
                            startContent={<FiBook />}
                            size="lg"
                        >
                            Browse Courses
                        </Button>
                    </Link>
                </div>
            )}
        </>
    );
}