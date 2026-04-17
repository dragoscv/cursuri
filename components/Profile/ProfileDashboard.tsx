'use client';

import React, { useContext, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import {
  FiBook,
  FiBarChart2,
  FiClock,
  FiAward,
  FiArrowRight,
  FiPlayCircle,
} from '@/components/icons/FeatherIcons';
import DefaultAvatar from '@/components/shared/DefaultAvatar';
import {
  GradientCard,
  MetricCard,
  ProgressRing,
  SectionShell,
} from '@/components/user-shell';
import DashboardProgress from './DashboardProgress';
import RecentActivity from './RecentActivity';
import AchievementsSection from './AchievementsSection';
import LearningPathSection from './LearningPathSection';
import PaymentHistorySection from './PaymentHistorySection';
import OfflineContentSection from './OfflineContentSection';
import ProfileActionButtons from './ProfileActionButtons';
import useProfileStats from './hooks/useProfileStats';
import useAchievements from './hooks/useAchievements';

export default function ProfileDashboard() {
  const t = useTranslations('profile.dashboard');
  const stats = useProfileStats();
  const { achievements } = useAchievements();
  const context = React.useContext(AppContext) as AppContextProps;
  if (!context) {
    throw new Error('AppContext not found');
  }
  const { user, userPaidProducts = [], courses = {}, lessonProgress = {}, userProfile } = context;
  if (!user) return null;

  const unlocked = achievements.filter((a) => a.isUnlocked).length;
  const totalAchievements = achievements.length;

  const displayName =
    user?.displayName || userProfile?.displayName || user?.email?.split('@')[0] || 'Learner';

  // Find next-up lesson (first incomplete lesson in any enrolled course)
  const nextLesson = useMemo(() => {
    for (const product of userPaidProducts) {
      const courseId = product.metadata?.courseId;
      if (!courseId) continue;
      const course = courses[courseId];
      if (!course) continue;
      const courseProgress = lessonProgress[courseId] || {};
      const incomplete = Object.entries(courseProgress).find(
        ([, p]: [string, any]) => !p?.isCompleted
      );
      if (incomplete) {
        return {
          courseId,
          courseName: course.name,
          lessonId: incomplete[0],
          progress: (incomplete[1] as any)?.progress ?? 0,
        };
      }
      // No partial progress yet — return first lesson placeholder
      return {
        courseId,
        courseName: course.name,
        lessonId: null,
        progress: 0,
      };
    }
    return null;
  }, [userPaidProducts, courses, lessonProgress]);

  const overallPct = stats.lessonCompletionPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <GradientCard className="overflow-hidden p-0" flush>
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left: greeting */}
          <div className="md:col-span-8 p-6 md:p-8 relative">
            <div
              aria-hidden
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--ai-primary) 15%, transparent) 0%, transparent 50%), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--ai-secondary) 15%, transparent) 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="ring-4 ring-[color:var(--ai-card-bg)] rounded-full overflow-hidden shadow-md">
                  {user?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt={displayName} className="w-12 h-12 object-cover" />
                  ) : (
                    <DefaultAvatar name={displayName} size={48} />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">
                    {t('title')}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ai-foreground)]">
                    {`Welcome back, ${displayName}`}
                  </h1>
                </div>
              </div>
              <p className="text-sm md:text-base text-[color:var(--ai-muted)] max-w-xl">
                {t('description')}
              </p>

              {nextLesson && (
                <Link
                  href={
                    nextLesson.lessonId
                      ? `/courses/${nextLesson.courseId}/lessons/${nextLesson.lessonId}`
                      : `/courses/${nextLesson.courseId}`
                  }
                  className="mt-5 inline-flex items-center gap-3 px-4 h-11 rounded-xl bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-md shadow-[color:var(--ai-primary)]/25 hover:shadow-lg hover:shadow-[color:var(--ai-primary)]/40 transition-all hover:-translate-y-0.5 group"
                >
                  <FiPlayCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Continue · <span className="font-semibold">{nextLesson.courseName}</span>
                  </span>
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Right: ring + summary */}
          <div className="md:col-span-4 relative border-t md:border-t-0 md:border-l border-[color:var(--ai-card-border)] p-6 md:p-8 flex items-center justify-center bg-gradient-to-br from-[color:var(--ai-primary)]/5 to-transparent">
            <div className="flex items-center gap-5">
              <ProgressRing value={overallPct} size={104} strokeWidth={10} tone="primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">
                  Overall progress
                </p>
                <p className="text-2xl font-bold text-[color:var(--ai-foreground)]">
                  {stats.completedLessons}{' '}
                  <span className="text-sm text-[color:var(--ai-muted)] font-normal">
                    / {stats.totalLessons} lessons
                  </span>
                </p>
                <p className="text-xs text-[color:var(--ai-muted)] mt-1">
                  {stats.totalHours} h of content unlocked
                </p>
              </div>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* KPI grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: t('enrolledCourses'),
            value: stats.totalCoursesEnrolled,
            hint: t('completedCoursesCount', { count: stats.completedCourses }),
            icon: <FiBook className="w-5 h-5" />,
            tone: 'primary' as const,
          },
          {
            label: t('lessonsCompleted'),
            value: stats.completedLessons,
            hint: t('totalLessons', { count: stats.totalLessons }),
            icon: <FiBarChart2 className="w-5 h-5" />,
            tone: 'success' as const,
          },
          {
            label: t('learningHours'),
            value: stats.totalHours,
            hint: t('totalHoursContent'),
            icon: <FiClock className="w-5 h-5" />,
            tone: 'warning' as const,
          },
          {
            label: t('achievements'),
            value: unlocked,
            hint: `${unlocked}/${totalAchievements} ${t('achievementsUnlocked')}`,
            icon: <FiAward className="w-5 h-5" />,
            tone: 'danger' as const,
          },
        ].map((m) => (
          <motion.div
            key={m.label}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
            }}
          >
            <MetricCard {...m} />
          </motion.div>
        ))}
      </motion.div>

      {/* Progress section (existing chart-based) */}
      <DashboardProgress
        courseCompletionPercentage={stats.courseCompletionPercentage}
        lessonCompletionPercentage={stats.lessonCompletionPercentage}
        completedCourses={stats.completedCourses}
        totalCoursesEnrolled={stats.totalCoursesEnrolled}
        completedLessons={stats.completedLessons}
        totalLessons={stats.totalLessons}
        userPaidProducts={userPaidProducts}
        courses={courses}
        lessonProgress={lessonProgress}
      />

      {/* Recent activity */}
      <RecentActivity activities={stats.recentActivity} />

      {/* Side cards */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <AchievementsSection />
      </div>

      <LearningPathSection />
      <PaymentHistorySection />
      <OfflineContentSection />
      <ProfileActionButtons hasPaidCourses={userPaidProducts?.length > 0} />
    </div>
  );
}
