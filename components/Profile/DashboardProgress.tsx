import React, { useState } from 'react';
import { Card, CardBody, Progress, Tabs, Tab } from '@heroui/react';
import Button from '@/components/ui/Button';
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

                // Use lessonProgress for counts (only counts accessed lessons)
                const courseLessonsData = lessonProgress[courseId] || {};
                const courseLessons = Object.keys(courseLessonsData).length;
                const courseCompleted = Object.values(courseLessonsData)
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
        <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                <div className="p-5">
                    <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiTrendingUp className="mr-2 text-[color:var(--ai-primary)]" />
                                <span>{t('title')}</span>
                            </h3>
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
                                        aria-label={t('courseCompletion')}
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
                                        aria-label={t('lessonCompletion')}
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
                                        {t('courseCompletion')}
                                    </span>
                                    <span className="text-sm font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                        {completedCourses}/{totalCoursesEnrolled}
                                    </span>
                                </div>
                                <Progress
                                    value={courseCompletionPercentage}
                                    aria-label={t('courseCompletion')}
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
                                    aria-label={t('lessonCompletion')}
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

                                        // Use lessons collection for accurate total count
                                        const courseLessonsData = lessonProgress[courseId] || {};
                                        const courseLessons = Object.keys(courseLessonsData).length;
                                        const courseCompleted = Object.values(courseLessonsData)
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
                </div>
            </Card>
        </div>
    );
}
