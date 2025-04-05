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
        <Card className="border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]/50">
            <CardBody>
                <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                    <FiTrendingUp className="text-[color:var(--ai-primary)]" />
                    Your Learning Progress
                </h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70">Course Completion</span>
                            <span className="text-sm font-medium text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70">
                                {completedCourses}/{totalCoursesEnrolled}
                            </span>
                        </div>
                        <Progress
                            value={courseCompletionPercentage}
                            classNames={{
                                indicator: "bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]",
                            }}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70">Lesson Completion</span>
                            <span className="text-sm font-medium text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70">
                                {completedLessons}/{totalLessons}
                            </span>
                        </div>
                        <Progress
                            value={lessonCompletionPercentage}
                            classNames={{
                                indicator: "bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-secondary)]",
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
                                    <span className="text-sm font-medium text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70 truncate max-w-[80%]">
                                        {course.name}
                                    </span>
                                    <span className="text-sm font-medium text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70">
                                        {courseProgress}%
                                    </span>
                                </div>
                                <Progress
                                    value={courseProgress}
                                    classNames={{
                                        indicator: `bg-gradient-to-r ${index % 3 === 0 ? "from-[color:var(--ai-primary)] to-[color:var(--ai-accent)]" :
                                            index % 3 === 1 ? "from-[color:var(--ai-secondary)] to-[color:var(--ai-primary)]" :
                                                "from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)]"
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