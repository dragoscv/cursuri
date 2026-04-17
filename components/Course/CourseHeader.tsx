'use client';
import React from 'react';
import { Course } from '../../types';
import { Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  FiClock,
  FiUsers,
  FiBook,
  FiStar,
  FiAward,
} from '@/components/icons/FeatherIcons';
import { GradientCard } from '@/components/user-shell';

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
  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)] backdrop-blur-sm">
    <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-[color:var(--ai-primary)]/15 to-[color:var(--ai-secondary)]/15 text-[color:var(--ai-primary)] shrink-0">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--ai-muted)] leading-none">
        {label}
      </p>
      <p className="text-sm font-semibold text-[color:var(--ai-foreground)] truncate">{value}</p>
    </div>
  </div>
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
    <GradientCard className="p-0 overflow-hidden" flush>
      <div className="relative">
        {/* Decorative gradient backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--ai-primary) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--ai-secondary) 18%, transparent) 0%, transparent 55%)',
          }}
        />

        <div className="relative p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
            {ec.isFeatured && (
              <Chip color="warning" variant="flat" size="sm" startContent={<FiStar className="w-3 h-3" />}>
                {tCourses('badges.featured')}
              </Chip>
            )}
            {ec.isNew && (
              <Chip color="success" variant="flat" size="sm">
                {tCourses('badges.new')}
              </Chip>
            )}
            {ec.level && (
              <Chip color="primary" variant="flat" size="sm" className="capitalize">
                {ec.level}
              </Chip>
            )}
            {ec.certificate && (
              <Chip color="secondary" variant="flat" size="sm" startContent={<FiAward className="w-3 h-3" />}>
                {tCourses('badges.certificate')}
              </Chip>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Title + description */}
            <div className="md:col-span-8">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] bg-clip-text text-transparent leading-tight"
              >
                {ec.title || ec.name}
              </motion.h1>
              {ec.description && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-4 text-base md:text-lg text-[color:var(--ai-muted)] leading-relaxed"
                >
                  {ec.description}
                </motion.p>
              )}
            </div>

            {/* Rating block */}
            {ratingDisplay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="md:col-span-4 self-start rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm p-5 text-center md:text-left"
              >
                <p className="text-xs uppercase tracking-wider font-semibold text-[color:var(--ai-muted)] mb-2">
                  {t('status.courseRating')}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-4xl font-extrabold bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                    {ratingDisplay}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex gap-0.5 text-[color:var(--ai-warning,#F59E0B)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className="w-3.5 h-3.5" />
                      ))}
                    </div>
                    <span className="text-xs text-[color:var(--ai-muted)] mt-1">
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
                label="Duration"
                value={ec.duration || '—'}
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              <StatPill
                icon={<FiBook className="w-4 h-4" />}
                label="Lessons"
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
                label="Students"
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
                label="Certificate"
                value={ec.certificate ? 'Included' : 'On request'}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </GradientCard>
  );
};

export default CourseHeader;
