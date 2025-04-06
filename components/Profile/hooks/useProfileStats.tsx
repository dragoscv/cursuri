import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';

export default function useProfileStats() {
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

    // Calculate progress percentages
    const lessonCompletionPercentage = stats.totalLessons > 0
        ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
        : 0;

    const courseCompletionPercentage = stats.totalCoursesEnrolled > 0
        ? Math.round((stats.completedCourses / stats.totalCoursesEnrolled) * 100)
        : 0;

    return {
        ...stats,
        lessonCompletionPercentage,
        courseCompletionPercentage
    };
}