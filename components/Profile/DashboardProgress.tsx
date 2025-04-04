import React from 'react';
import { Card, CardBody, Progress } from '@heroui/react';
import { FiTrendingUp } from '@/components/icons/FeatherIcons';

interface DashboardProgressProps {
    courseCompletionPercentage: number;
    lessonCompletionPercentage: number;
    completedCourses: number;
    totalCoursesEnrolled: number;
    completedLessons: number;
    totalLessons: number;
    userPaidProducts: any[];
    courses: Record<string, any>;
    lessonProgress: Record<string, Record<string, any>>;
}

export default function DashboardProgress({
    courseCompletionPercentage,
    lessonCompletionPercentage,
    completedCourses,
    totalCoursesEnrolled,
    completedLessons,
    totalLessons,
    userPaidProducts,
    courses,
    lessonProgress
}: DashboardProgressProps) {
    return (
        <Card className="border border-gray-200 dark:border-gray-800">
            <CardBody>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <FiTrendingUp className="text-indigo-500" />
                    Your Learning Progress
                </h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Completion</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {completedCourses}/{totalCoursesEnrolled}
                            </span>
                        </div>
                        <Progress
                            value={courseCompletionPercentage}
                            classNames={{
                                indicator: "bg-gradient-to-r from-indigo-500 to-purple-600",
                            }}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lesson Completion</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {completedLessons}/{totalLessons}
                            </span>
                        </div>
                        <Progress
                            value={lessonCompletionPercentage}
                            classNames={{
                                indicator: "bg-gradient-to-r from-green-500 to-teal-600",
                            }}
                        />
                    </div>

                    {userPaidProducts.map((product, index) => {
                        const courseId = product.metadata?.courseId;
                        const course = courses[courseId];
                        if (!course) return null;

                        const courseLessons = Object.keys(lessonProgress[courseId] || {}).length;
                        const courseCompleted = Object.values(lessonProgress[courseId] || {})
                            .filter(progress => progress.isCompleted).length;

                        const courseProgress = courseLessons > 0
                            ? Math.round((courseCompleted / courseLessons) * 100)
                            : 0;

                        return (
                            <div key={courseId}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80%]">
                                        {course.name}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {courseProgress}%
                                    </span>
                                </div>
                                <Progress
                                    value={courseProgress}
                                    classNames={{
                                        indicator: `bg-gradient-to-r ${index % 3 === 0 ? "from-blue-500 to-cyan-600" :
                                            index % 3 === 1 ? "from-purple-500 to-pink-600" :
                                                "from-orange-500 to-red-600"
                                            }`,
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </CardBody>
        </Card>
    );
}