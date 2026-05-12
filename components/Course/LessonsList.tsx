import React from 'react';
import { stripHtml } from '@/utils/security/htmlSanitizer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FiBookOpen,
  FiLock,
  FiCheckCircle,
  FiPlay,
  FiClock,
} from '@/components/icons/FeatherIcons';
import { motion } from 'framer-motion';
import { Course, Lesson } from '@/types';
import { useTranslations } from 'next-intl';

interface LessonsListProps {
  lessons: Lesson[];
  course?: Course;
  courseId?: string;
  userHasAccess?: boolean;
  completedLessons?: Record<string, boolean>;
}

export default function LessonsList({
  lessons,
  course,
  courseId: propsCourseId,
  userHasAccess = false,
  completedLessons = {},
}: LessonsListProps) {
  const params = useParams();
  const courseId = propsCourseId || params.courseId;
  const t = useTranslations('courses.lessonsList');

  // Format duration in minutes to "HH:MM" format or "MM min" if less than an hour
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '00:00';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}` : `${mins} min`;
  };

  if (!lessons || lessons.length === 0) {
    return (
      <div className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] rounded-2xl p-8 border-t-2 border-t-amber-500">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <FiBookOpen className="text-amber-500 text-2xl mb-3" aria-hidden />
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--ai-muted)] mb-2">
            {t('courseContent')}
          </p>
          <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-2">
            {t('noLessonsYet')}
          </h3>
          <p className="text-[color:var(--ai-muted)] max-w-md text-sm">
            {t('noLessonsDescription')}
          </p>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 15,
      },
    },
  };

  // Filter out null or undefined lessons and then sort by order property
  const sortedLessons = [...lessons]
    .filter((lesson) => lesson != null)
    .sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });

  // Calculate total duration in minutes
  const totalDuration = sortedLessons.reduce((total, lesson) => {
    // Skip if lesson is undefined or null
    if (!lesson) return total;

    // Only count duration if it's a valid number > 0
    const durationMins =
      typeof lesson?.duration === 'number' && lesson.duration > 0
        ? lesson.duration
        : typeof lesson?.duration === 'string' &&
            !isNaN(parseInt(lesson.duration, 10)) &&
            parseInt(lesson.duration, 10) > 0
          ? parseInt(lesson.duration, 10)
          : 0;

    return total + durationMins;
  }, 0); // Calculate completed duration (sum of durations of completed lessons)
  const completedDuration = sortedLessons.reduce((total, lesson) => {
    // Skip if lesson is undefined or null
    if (!lesson) return total;

    if (lesson.id && completedLessons[lesson.id]) {
      const durationMins =
        typeof lesson?.duration === 'number' && lesson.duration > 0
          ? lesson.duration
          : typeof lesson?.duration === 'string' &&
              !isNaN(parseInt(lesson.duration, 10)) &&
              parseInt(lesson.duration, 10) > 0
            ? parseInt(lesson.duration, 10)
            : 0;
      return total + durationMins;
    }
    return total;
  }, 0);

  // Calculate remaining duration
  const remainingDuration = totalDuration - completedDuration;

  // Format total duration
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const durationText =
    hours > 0
      ? `${hours} ${hours === 1 ? 'hour' : 'hours'}${minutes > 0 ? ` ${minutes} min` : ''}`
      : `${minutes} minutes`;

  // Format remaining duration
  const remainingHours = Math.floor(remainingDuration / 60);
  const remainingMinutes = remainingDuration % 60;
  const remainingText =
    remainingHours > 0 ? `${remainingHours}h ${remainingMinutes}m` : `${remainingMinutes} min`;

  return (
    <div className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] rounded-2xl p-6 border-t-2 border-t-amber-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--ai-muted)] mb-2">
            {t('courseContent')}
          </p>
          <h2 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-2">
            {t('courseContent')}
          </h2>
          <div className="flex items-center gap-3 text-[color:var(--ai-muted)] text-sm">
            <div className="flex items-center gap-1.5">
              <FiBookOpen className="w-3.5 h-3.5" aria-hidden />
              <span>{t('lessons', { count: sortedLessons.length })}</span>
            </div>
            <span aria-hidden>•</span>
            <div className="flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5" aria-hidden />
              <span>{t('totalDuration', { duration: durationText })}</span>
            </div>

            {userHasAccess && Object.keys(completedLessons).length > 0 && (
              <>
                <span aria-hidden>•</span>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <FiClock className="w-3.5 h-3.5" aria-hidden />
                  <span>{t('remaining', { duration: remainingText })}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {userHasAccess && Object.keys(completedLessons).length > 0 && (
          <div className="px-3 py-2 rounded-full border border-[color:var(--ai-card-border)] text-sm">
            <div className="flex items-center gap-2">
              <div className="text-[color:var(--ai-foreground)] font-medium tabular-nums">
                {Object.values(completedLessons).filter((v) => v).length} / {sortedLessons.length}
              </div>
              <div className="w-24 h-1.5 bg-[color:var(--ai-card-border)]/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((Object.values(completedLessons).filter((v) => v).length / sortedLessons.length) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[color:var(--ai-muted)] text-xs">{t('completed')}</span>
            </div>
          </div>
        )}
      </div>{' '}
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedLessons
          .filter((lesson) => lesson && lesson.id)
          .map((lesson, index) => {
            const isCompleted = lesson && lesson.id ? completedLessons[lesson.id] : false;

            return (
              <motion.div
                key={lesson?.id || index}
                variants={itemVariants}
                className={`relative rounded-2xl transition-colors duration-200 group border
                                ${
                                  userHasAccess || lesson?.isFree
                                    ? 'border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] hover:border-[color:var(--ai-foreground)]/40 cursor-pointer'
                                    : 'border-[color:var(--ai-card-border)]/60 border-dashed bg-[color:var(--ai-card-bg)]/50 cursor-not-allowed'
                                }
                                ${isCompleted ? 'border-l-[3px] border-l-amber-500' : ''}
                            `}
              >
                {/* Lesson Index Circle */}
                <div
                  className={`absolute -left-3 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-[color:var(--ai-background)]
                                ${
                                  isCompleted
                                    ? 'bg-amber-500 text-[color:var(--ai-background)]'
                                    : userHasAccess || lesson.isFree
                                      ? 'bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)]'
                                      : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-muted)]'
                                }
                            `}
                >
                  {isCompleted ? <FiCheckCircle className="w-3.5 h-3.5" aria-hidden /> : index + 1}
                </div>

                {userHasAccess || lesson.isFree ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${lesson?.id || ''}`}
                    className="block p-4 pl-6"
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`rounded-md p-2 mt-0.5 flex-shrink-0
                                                ${
                                                  isCompleted
                                                    ? 'bg-amber-500/10 text-amber-500'
                                                    : 'bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]'
                                                }
                                            `}
                        >
                          {isCompleted ? (
                            <FiCheckCircle className="h-4 w-4" aria-hidden />
                          ) : (
                            <FiPlay className="h-4 w-4" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`font-medium transition-colors duration-200 ${
                              isCompleted
                                ? 'text-[color:var(--ai-foreground)]'
                                : 'text-[color:var(--ai-foreground)] group-hover:text-amber-500'
                            }`}
                          >
                            {lesson.title || lesson.name || t('unnamedLesson')}
                          </h3>
                          <p className="text-sm text-[color:var(--ai-muted)] line-clamp-2 mt-1">
                            {lesson.description
                              ? stripHtml(lesson.description)
                              : t('noDescription')}
                          </p>
                          {lesson.isFree && !userHasAccess && (
                            <span className="inline-block mt-2 text-[10px] font-medium uppercase tracking-[0.14em] border border-amber-500/50 text-amber-500 px-2 py-0.5 rounded-full">
                              {t('freePreview')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-sm text-[color:var(--ai-muted)] tabular-nums">
                          {lesson.duration ? lesson.duration + ' min' : '-'}
                        </span>

                        {isCompleted && (
                          <span className="inline-block text-[10px] uppercase tracking-[0.14em] border border-amber-500/50 text-amber-500 px-2 py-0.5 rounded-full font-medium">
                            {t('completedBadge')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="p-4 pl-6">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="rounded-md bg-[color:var(--ai-card-border)]/30 p-2 mt-0.5 flex-shrink-0">
                          <FiLock className="h-4 w-4 text-[color:var(--ai-muted)]" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-[color:var(--ai-muted)]">
                            {lesson.title || lesson.name || 'Unnamed Lesson'}
                          </h3>
                          <p className="text-sm text-[color:var(--ai-muted)]/70 line-clamp-2 mt-1">
                            {lesson.description
                              ? stripHtml(lesson.description)
                              : 'No description available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <span className="text-sm text-[color:var(--ai-muted)]/70 tabular-nums">
                          {lesson.duration ? lesson.duration + ' min' : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
      </motion.div>
    </div>
  );
}
