import React, { useState } from 'react';
import { Card, CardBody, Progress, Button, Tabs, Tab } from '@heroui/react';
import { FiTrendingUp, FiBarChart2, FiPieChart, FiList } from '@/components/icons/FeatherIcons';
import ProgressChart from './charts/ProgressChart';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('profile.progress');
    const [viewType, setViewType] = useState<'chart' | 'list'>('chart');
    const [chartType, setChartType] = useState<'bar' | 'doughnut'>('doughnut');

    // Prepare data for course progress chart
    const getCourseChartData = () => {
        // Extract at most 6 courses to display
        const displayedCourses = userPaidProducts
            .slice(0, 6)
            .map(product => {
                const courseId = product.metadata?.courseId;
                const course = courses[courseId];
                if (!course) return null;

                const courseLessons = Object.keys(lessonProgress[courseId] || {}).length;
                const courseCompleted = Object.values(lessonProgress[courseId] || {})
                    .filter(progress => progress.isCompleted).length;

                const courseProgress = courseLessons > 0
                    ? Math.round((courseCompleted / courseLessons) * 100)
                    : 0;

                return {
                    id: courseId,
                    name: course.name,
                    progress: courseProgress,
                    completed: courseCompleted,
                    total: courseLessons
                };
            })
            .filter(Boolean);

        // Generate chart colors
        const courseChartColors = [
            '#7446ED', // Primary purple
            '#2563EB', // Blue
            '#10B981', // Green
            '#F97316', // Orange
            '#EF4444', // Red
            '#8B5CF6', // Purple
        ];

        return {
            labels: displayedCourses.map(course => shortenName(course?.name || '')),
            data: displayedCourses.map(course => course?.completed || 0),
            colors: courseChartColors.slice(0, displayedCourses.length),
        };
    };

    // Prepare data for completion overview chart
    const getOverviewChartData = () => {
        return {
            labels: [t('completed'), t('inProgress')],
            data: [completedCourses, totalCoursesEnrolled - completedCourses],
            colors: ['#10B981', '#7446ED'], // Green and Purple
        };
    };

    // Helper to shorten long course names for chart labels
    const shortenName = (name: string, maxLength = 12) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    };

    return (
        <Card className="border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]/50 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"></div>
            <CardBody className="p-6">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-[color:var(--ai-primary)]/10">
                            <FiTrendingUp className="text-[color:var(--ai-primary)]" />
                        </div>
                        {t('title')}
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            color={viewType === 'chart' ? 'primary' : 'default'}
                            variant={viewType === 'chart' ? 'solid' : 'flat'}
                            onClick={() => setViewType('chart')}
                            className="p-1.5"
                        >
                            <FiBarChart2 />
                        </Button>
                        <Button
                            size="sm"
                            color={viewType === 'list' ? 'primary' : 'default'}
                            variant={viewType === 'list' ? 'solid' : 'flat'}
                            onClick={() => setViewType('list')}
                            className="p-1.5"
                        >
                            <FiList />
                        </Button>
                    </div>
                </div>

                {viewType === 'chart' ? (
                    <div className="space-y-4">
                        <Tabs
                            aria-label="Chart options"
                            color="primary"
                            classNames={{
                                base: "w-full",
                                tabList: "gap-4",
                            }}
                            onSelectionChange={(key) => setChartType(key as 'bar' | 'doughnut')}
                        >
                            <Tab
                                key="doughnut"
                                title={
                                    <div className="flex items-center gap-2">
                                        <FiPieChart />
                                        <span>{t('pieChart')}</span>
                                    </div>
                                }
                            >
                                <div className="flex flex-wrap gap-4 justify-around mt-4">
                                    <div className="text-center">
                                        <h3 className="text-sm font-medium mb-2 text-[color:var(--ai-muted)]">{t('courseCompletion')}</h3>
                                        <ProgressChart
                                            data={getOverviewChartData()}
                                            type="doughnut"
                                            height={180}
                                            width={180}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-sm font-medium mb-2 text-[color:var(--ai-muted)]">{t('lessonsCompleted')}</h3>
                                        <ProgressChart
                                            data={getCourseChartData()}
                                            type="doughnut"
                                            height={180}
                                            width={180}
                                        />
                                    </div>
                                </div>
                            </Tab>
                            <Tab
                                key="bar"
                                title={
                                    <div className="flex items-center gap-2">
                                        <FiBarChart2 />
                                        <span>{t('barChart')}</span>
                                    </div>
                                }
                            >
                                <div className="flex flex-wrap gap-4 justify-around mt-4">
                                    <ProgressChart
                                        data={getCourseChartData()}
                                        type="bar"
                                        height={200}
                                        width={400}
                                        className="mx-auto"
                                    />
                                </div>
                            </Tab>
                        </Tabs>

                        <div className="space-y-4 mt-6 pt-5 border-t border-[color:var(--ai-card-border)]/30">
                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm font-medium text-[color:var(--ai-foreground)]/90 dark:text-[color:var(--ai-foreground)]/80 flex items-center gap-2">
                                        <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--ai-primary)]"></span>
                                        {t('courseCompletion')}
                                    </span>
                                    <span className="text-sm font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                        {completedCourses}/{totalCoursesEnrolled}
                                    </span>
                                </div>
                                <Progress
                                    value={courseCompletionPercentage}
                                    classNames={{
                                        track: "h-2 rounded-full",
                                        indicator: "bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full",
                                    }}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm font-medium text-[color:var(--ai-foreground)]/90 dark:text-[color:var(--ai-foreground)]/80 flex items-center gap-2">
                                        <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--ai-success)]"></span>
                                        {t('lessonCompletion')}
                                    </span>
                                    <span className="text-sm font-medium bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] px-2 py-0.5 rounded-full">
                                        {completedLessons}/{totalLessons}
                                    </span>
                                </div>
                                <Progress
                                    value={lessonCompletionPercentage}
                                    classNames={{
                                        track: "h-2 rounded-full",
                                        indicator: "bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-secondary)] rounded-full",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-3">
                                <span className="text-sm font-medium text-[color:var(--ai-foreground)]/90 dark:text-[color:var(--ai-foreground)]/80 flex items-center gap-2">
                                    <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--ai-primary)]"></span>
                                    Course Completion
                                </span>
                                <span className="text-sm font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                    {completedCourses}/{totalCoursesEnrolled}
                                </span>
                            </div>
                            <Progress
                                value={courseCompletionPercentage}
                                classNames={{
                                    track: "h-2 rounded-full",
                                    indicator: "bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full",
                                }}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-3">
                                <span className="text-sm font-medium text-[color:var(--ai-foreground)]/90 dark:text-[color:var(--ai-foreground)]/80 flex items-center gap-2">
                                    <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--ai-success)]"></span>
                                    Lesson Completion
                                </span>
                                <span className="text-sm font-medium bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] px-2 py-0.5 rounded-full">
                                    {completedLessons}/{totalLessons}
                                </span>
                            </div>
                            <Progress
                                value={lessonCompletionPercentage}
                                classNames={{
                                    track: "h-2 rounded-full",
                                    indicator: "bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-secondary)] rounded-full",
                                }}
                            />
                        </div>

                        <div className="mt-6 pt-5 border-t border-[color:var(--ai-card-border)]/30">
                            <h3 className="text-sm font-semibold mb-4 text-[color:var(--ai-foreground)]">{t('courseByCourse')}</h3>

                            <div className="space-y-5">
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
                                        <div key={`${courseId}-${index}`} className="bg-[color:var(--ai-card-bg)]/50 p-3 rounded-lg border border-[color:var(--ai-card-border)]/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-[color:var(--ai-foreground)] truncate max-w-[80%] flex items-center gap-1.5">
                                                    <span className={`inline-block h-2 w-2 rounded-full ${courseProgress === 100
                                                        ? "bg-[color:var(--ai-success)]"
                                                        : courseProgress > 50
                                                            ? "bg-[color:var(--ai-secondary)]"
                                                            : "bg-[color:var(--ai-primary)]"
                                                        }`}></span>
                                                    {course.name}
                                                </span>
                                                <span className="text-xs font-medium bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)]/30 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20">
                                                    {courseProgress}%
                                                </span>
                                            </div>                                            <Progress
                                                value={courseProgress}
                                                size="sm"
                                                aria-label={`${course.name} progress`}
                                                classNames={{
                                                    track: "h-1.5 rounded-full",
                                                    indicator: `bg-gradient-to-r rounded-full ${index % 3 === 0 ? "from-[color:var(--ai-primary)] to-[color:var(--ai-accent)]" :
                                                        index % 3 === 1 ? "from-[color:var(--ai-secondary)] to-[color:var(--ai-primary)]" :
                                                            "from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)]"
                                                        }`,
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
