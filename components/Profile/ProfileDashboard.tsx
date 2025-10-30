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
import useAchievements from './hooks/useAchievements';
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
    } = useProfileStats();

    // Get achievements for real achievement count
    const { achievements } = useAchievements();
    const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;
    const totalAchievements = achievements.length;

    // Get the context to pass to subcomponents
    const context = React.useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("AppContext not found");
    }

    const {
        user,
        userPaidProducts = [],
        courses = {},
        lessonProgress = {},
        userPreferences,
        toggleTheme,
        saveUserPreferences
    } = context;

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
                    value={unlockedAchievements}
                    footer={`${unlockedAchievements}/${totalAchievements} ${t('achievementsUnlocked')}`}
                    colorClass="from-[color:var(--ai-accent)] to-[color:var(--ai-primary)]"
                />
            </div>

            {/* Progress Section */}
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

            {/* New Sections */}
            <AchievementsSection />
            <LearningPathSection />
            <PaymentHistorySection />

            
            {/* <ProfileSettingsSection
                isDark={userPreferences?.isDark ?? false}
                emailNotifications={userPreferences?.emailNotifications ?? true}
                courseUpdates={userPreferences?.courseUpdates ?? true}
                onToggleDark={(value) => {
                    toggleTheme();
                }}
                onToggleEmailNotifications={(value) => {
                    if (userPreferences && saveUserPreferences) {
                        saveUserPreferences({ ...userPreferences, emailNotifications: value });
                    }
                }}
                onToggleCourseUpdates={(value) => {
                    if (userPreferences && saveUserPreferences) {
                        saveUserPreferences({ ...userPreferences, courseUpdates: value });
                    }
                }}
            /> */}

            {/* Offline Content Section */}
            <OfflineContentSection />

            {/* Continue Learning Button */}
            <ProfileActionButtons hasPaidCourses={userPaidProducts?.length > 0} />
        </>
    );
}
