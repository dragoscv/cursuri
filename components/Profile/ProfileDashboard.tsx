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

export default function ProfileDashboard() {
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
                title="Your Learning Dashboard"
                description="Track your progress, view statistics, and continue learning."
            />

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={<FiBook className="text-[color:var(--ai-primary)]" />}
                    title="Enrolled Courses"
                    value={totalCoursesEnrolled}
                    footer={`${completedCourses} completed`}
                    colorClass="from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                />
                <StatsCard
                    icon={<FiBarChart2 className="text-[color:var(--ai-success)]" />}
                    title="Lessons Completed"
                    value={completedLessons}
                    footer={`${totalLessons} total`}
                    colorClass="from-[color:var(--ai-success)] to-[color:var(--ai-secondary)]"
                />
                <StatsCard
                    icon={<FiClock className="text-[color:var(--ai-secondary)]" />}
                    title="Learning Hours"
                    value={totalHours}
                    footer="Total hours of content"
                    colorClass="from-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                />
                <StatsCard
                    icon={<FiAward className="text-[color:var(--ai-accent)]" />}
                    title="Achievements"
                    value={completedCourses}
                    footer="Courses mastered"
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
