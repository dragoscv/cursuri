import React from 'react';
import { FiBook, FiBarChart2, FiClock, FiAward } from '@/components/icons/FeatherIcons';
import ProfileHeader from './ProfileHeader';
import StatsCard from './StatsCard';
import DashboardProgress from './DashboardProgress';
import RecentActivity from './RecentActivity';
import ProfileActionButtons from './ProfileActionButtons';
import useProfileStats from './hooks/useProfileStats';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import AchievementsSection from './AchievementsSection';
import PaymentHistorySection from './PaymentHistorySection';
import LearningPathSection from './LearningPathSection';
import ProfileSettingsSection from './ProfileSettingsSection';
import OfflineContentSection from './OfflineContentSection';
import { useTranslations } from 'next-intl';

export default function ProfileDashboard() {
    const t = useTranslations('profile.dashboard');
    const tStats = useTranslations('profile');
    const {
        totalCoursesEnrolled,
        completedCourses,
        totalLessons,
        completedLessons,
        totalHours,
        recentActivity,
        lessonCompletionPercentage,
        courseCompletionPercentage
    } = useProfileStats();    // Get the context to pass to subcomponents

    const context = React.useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, userPaidProducts = [], courses = {}, lessonProgress = {} } = context;

    if (!user) {
        return null;
    }

    return (
        <>
            <ProfileHeader
                title={t('title')}
                description={t('description')}
            />

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={<FiBook className="text-[color:var(--ai-primary)]" />}
                    title={t('enrolledCourses')}
                    value={totalCoursesEnrolled}
                    footer={t('completedCoursesCount', { count: completedCourses })}
                    colorClass="from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                />
                <StatsCard
                    icon={<FiBarChart2 className="text-[color:var(--ai-success)]" />}
                    title={t('lessonsCompleted')}
                    footer={t('totalLessons', { count: totalLessons })}
                    value={completedLessons}
                    colorClass="from-[color:var(--ai-success)] to-[color:var(--ai-secondary)]"
                />
                <StatsCard
                    icon={<FiClock className="text-[color:var(--ai-secondary)]" />}
                    title={t('learningHours')}
                    value={totalHours}
                    footer={t('totalHoursContent')}
                    colorClass="from-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                />
                <StatsCard
                    icon={<FiAward className="text-[color:var(--ai-accent)]" />}
                    title={t('achievements')}
                    value={completedCourses}
                    footer={t('coursesMastered')}
                    colorClass="from-[color:var(--ai-accent)] to-[color:var(--ai-primary)]"
                />
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardProgress
                    courseCompletionPercentage={courseCompletionPercentage}
                    lessonCompletionPercentage={lessonCompletionPercentage}
                    completedCourses={completedCourses}
                    totalCoursesEnrolled={totalCoursesEnrolled}
                    completedLessons={completedLessons}
                    totalLessons={totalLessons}
                    userPaidProducts={userPaidProducts}
                    courses={courses}
                    lessonProgress={lessonProgress}
                />

                {/* Recent Activity */}
                <RecentActivity activities={recentActivity} />
            </div>

            {/* New Sections */}
            <AchievementsSection />
            <LearningPathSection />
            <PaymentHistorySection />            <ProfileSettingsSection />

            {/* Offline Content Section */}
            <OfflineContentSection />

            {/* Continue Learning Button */}
            <ProfileActionButtons hasPaidCourses={userPaidProducts?.length > 0} />
        </>
    );
}
