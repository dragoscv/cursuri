import React, { useEffect } from 'react';
import { Course, Lesson } from '../../types';
import { Card, Divider } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiLayers, FiBookOpen } from '../icons/FeatherIcons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LessonsList from './LessonsList';
import CourseOverview from './CourseOverview';
import Reviews from './Reviews';

interface CourseDetailsProps {
  course: Course;
  lessons?: Lesson[];
  courseId?: string;
  hasAccess?: boolean;
  completedLessons?: Record<string, boolean>;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({
  course,
  lessons = [],
  courseId,
  hasAccess = false,
  completedLessons = {},
}) => {
  const t = useTranslations('courses.tabs');
  // For handling tab selection in URL
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [selectedTab, setSelectedTab] = React.useState(tabParam || 'content');

  // Update URL when tab changes
  const handleTabChange = (key: React.Key) => {
    setSelectedTab(key as string);
    if (courseId) {
      router.push(`/courses/${courseId}?tab=${String(key)}`, { scroll: false });
    }
  };

  // Update tab state when URL param changes
  useEffect(() => {
    if (tabParam) {
      setSelectedTab(tabParam);
    }
  }, [tabParam]);

  const tabs: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: t('overview'), icon: <FiLayers className="w-5 h-5" /> },
    { key: 'content', label: t('content'), icon: <FiBookOpen className="w-5 h-5" /> },
    {
      key: 'reviews',
      label: t('reviews'),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ),
    },
  ];

  return (
    <Card className="shadow-none border rounded-2xl border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] overflow-hidden">
      {/* Tabs Navigation — plain buttons (no HeroUI/framer-motion to avoid React 19 reconciler crash on tab swap) */}
      <div
        role="tablist"
        aria-label="Course details tabs"
        className="flex justify-center gap-2 border-b border-[color:var(--ai-card-border)]/50 p-2"
      >
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex flex-col items-center gap-1 px-4 py-3 min-w-20 text-sm transition-colors hover:opacity-90 ${
                isActive ? 'text-amber-500 font-semibold' : 'text-[color:var(--ai-muted)]'
              }`}
            >
              <span className={isActive ? 'text-amber-500' : 'text-[color:var(--ai-muted)]'}>
                {tab.icon}
              </span>
              <span className="text-xs">{tab.label}</span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 right-0 h-[2px] bg-amber-500"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="py-5 sm:py-6 px-4 sm:px-6">
        {selectedTab === 'overview' && <CourseOverview course={course} />}

        {selectedTab === 'content' && (
          <div>
            {courseId && (
              <div className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)]/30 rounded-xl p-1 shadow-inner">
                <LessonsList
                  lessons={lessons || []}
                  course={course}
                  courseId={courseId}
                  completedLessons={completedLessons}
                  userHasAccess={hasAccess}
                />
              </div>
            )}

            {!courseId && course.modules && course.modules.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {course.modules.map((module, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-[color:var(--ai-card-border)] rounded-lg overflow-hidden bg-[color:var(--ai-card-bg)] hover:border-[color:var(--ai-foreground)]/40 transition-colors duration-200"
                  >
                    <div className="bg-[color:var(--ai-card-bg)] p-3 sm:p-4 font-medium border-l-[3px] border-amber-500">
                      {module.title || `Module ${index + 1}`}
                    </div>
                    <div className="p-3 sm:p-4">
                      {' '}
                      <p className="text-sm sm:text-base text-[color:var(--ai-muted)] mb-2">
                        {module.description || ''}
                      </p>
                      <div className="text-xs sm:text-sm text-[color:var(--ai-muted)] flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6C3 4.34315 4.34315 3 6 3H8C9.65685 3 11 4.34315 11 6V8C11 9.65685 9.65685 11 8 11H6C4.34315 11 3 9.65685 3 8V6Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M13 6C13 4.34315 14.3431 3 16 3H18C19.6569 3 21 4.34315 21 6V8C21 9.65685 19.6569 11 18 11H16C14.3431 11 13 9.65685 13 8V6Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M3 16C3 14.3431 4.34315 13 6 13H8C9.65685 13 11 14.3431 11 16V18C11 19.6569 9.65685 21 8 21H6C4.34315 21 3 19.6569 3 18V16Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M13 16C13 14.3431 14.3431 13 16 13H18C19.6569 13 21 14.3431 21 16V18C21 19.6569 19.6569 21 18 21H16C14.3431 21 13 19.6569 13 18V16Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          {module.lessonCount || 'Multiple'} {t('lessonCount')}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                            <path
                              d="M12 7V12L15 15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {module.duration || 'Various'} {t('durationLabel')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!courseId &&
              (!course.modules || course.modules.length === 0) &&
              lessons.length === 0 && (
                <div className="bg-[color:var(--ai-card-bg)]/30 rounded-xl p-4 sm:p-6 text-center border border-[color:var(--ai-card-border)]/50 shadow-inner">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 text-[color:var(--ai-muted)] mx-auto mb-3 sm:mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <p className="text-sm sm:text-base text-[color:var(--ai-muted)]">
                    {t('noLessonsYet')}
                  </p>
                </div>
              )}
          </div>
        )}

        {selectedTab === 'reviews' && (
          <Reviews courseId={courseId || course.id} isPurchased={hasAccess} />
        )}
      </div>
    </Card>
  );
};

export default CourseDetails;
