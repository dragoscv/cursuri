'use client';
import React from 'react';
import { Course } from '../../types';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { FiClock, FiUsers, FiBook, FiStar, FiAward } from '@/components/icons/FeatherIcons';

interface CourseHeaderProps {
  course: Course;
}

interface ExtendedCourse extends Omit<Course, 'rating'> {
  isFeatured?: boolean;
  isNew?: boolean;
  level?: string;
  title?: string;
  students?: number;
  lessonsCount?: number;
  certificate?: boolean;
  rating?: number | string;
  reviewsCount?: number;
  fullDescription?: string;
}

const StatPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] transition-colors duration-200 hover:border-[color:var(--ai-foreground)]/40">
    <span
      className="grid place-items-center w-8 h-8 rounded-md text-amber-500 shrink-0"
      aria-hidden
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[color:var(--ai-muted)] leading-none">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--ai-foreground)] truncate tabular-nums">
        {value}
      </p>
    </div>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode; tone?: 'amber' | 'muted' }> = ({
  children,
  tone = 'muted',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[10px] font-semibold uppercase tracking-[0.12em] border ${
      tone === 'amber'
        ? 'border-amber-500/30 text-amber-500'
        : 'border-[color:var(--ai-card-border)] text-[color:var(--ai-muted)]'
    }`}
  >
    {children}
  </span>
);

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const ec = course as ExtendedCourse;
  const t = useTranslations('common');
  const tCourses = useTranslations('courses');

  const ratingDisplay =
    ec.rating !== undefined && ec.rating !== null
      ? typeof ec.rating === 'number'
        ? ec.rating.toFixed(1)
        : ec.rating
      : null;

  return (
    <div className="relative rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] p-6 md:p-8">
      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center gap-2 mb-5"
      >
        {ec.isFeatured && (
          <Pill tone="amber">
            <FiStar className="w-3 h-3" aria-hidden />
            {tCourses('badges.featured')}
          </Pill>
        )}
        {ec.isNew && <Pill tone="amber">{tCourses('badges.new')}</Pill>}
        {ec.level && <Pill>{ec.level}</Pill>}
        {ec.certificate && (
          <Pill>
            <FiAward className="w-3 h-3" aria-hidden />
            {tCourses('badges.certificate')}
          </Pill>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Title + description */}
        <div className="md:col-span-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-[color:var(--ai-foreground)] leading-[1.1]"
          >
            {ec.title || ec.name}
          </motion.h1>
          {ec.description && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-base md:text-lg text-[color:var(--ai-muted)] leading-relaxed max-w-2xl"
            >
              {ec.description}
            </motion.p>
          )}
        </div>

        {/* Rating block */}
        {ratingDisplay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="md:col-span-4 self-start rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)] p-5"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[color:var(--ai-muted)] mb-2">
              {t('status.courseRating')}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--ai-foreground)]">
                {ratingDisplay}
              </span>
              <div className="flex flex-col">
                <div className="flex gap-0.5 text-amber-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} className="w-3.5 h-3.5" />
                  ))}
                </div>
                <span className="text-xs text-[color:var(--ai-muted)] mt-1 tabular-nums">
                  {ec.reviewsCount || 0} {tCourses('stats.reviews')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stat pills */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
        }}
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <StatPill
            icon={<FiClock className="w-4 h-4" />}
            label={tCourses('stats.duration')}
            value={ec.duration || '—'}
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <StatPill
            icon={<FiBook className="w-4 h-4" />}
            label={tCourses('stats.lessonsLabel')}
            value={
              typeof ec.lessonsCount === 'number' && ec.lessonsCount > 0
                ? `${ec.lessonsCount} ${ec.lessonsCount === 1 ? tCourses('stats.lesson') : tCourses('stats.lessons')}`
                : tCourses('stats.lessonsComingSoon')
            }
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <StatPill
            icon={<FiUsers className="w-4 h-4" />}
            label={tCourses('stats.studentsLabel')}
            value={
              ec.students && ec.students > 0
                ? `${ec.students} ${tCourses('stats.students')}`
                : tCourses('stats.newCourse')
            }
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <StatPill
            icon={<FiAward className="w-4 h-4" />}
            label={tCourses('stats.certificateLabel')}
            value={
              ec.certificate
                ? tCourses('stats.certificateIncluded')
                : tCourses('stats.certificateOnRequest')
            }
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CourseHeader;
