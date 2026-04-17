'use client';

import React, { useState, useContext, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CoursesList from './CoursesList';
import CoursesFilter from './CoursesFilter';
import { AppContext } from '@/components/AppContext';
import { GradientCard, MetricCard, SectionShell } from '@/components/user-shell';
import {
  FiBookOpen,
  FiUsers,
  FiAward,
  FiArrowRight,
} from '@/components/icons/FeatherIcons';

export default function CoursesPage() {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const t = useTranslations('courses.subscriptionBanner');
  const tHeader = useTranslations('courses.header');

  const context = useContext(AppContext);
  const courses = context?.courses || {};
  const reviews = context?.reviews || {};
  const lessons = context?.lessons || {};

  const stats = useMemo(() => {
    const courseList = Object.values(courses);
    const total = courseList.length;
    let totalLessons = 0;
    let totalDurationMin = 0;
    let totalReviews = 0;
    let ratingSum = 0;
    courseList.forEach((c: any) => {
      const courseLessons = (lessons as any)[c.id] || {};
      const lessonValues = Object.values(courseLessons);
      totalLessons += lessonValues.length;
      lessonValues.forEach((l: any) => {
        const d =
          typeof l?.duration === 'number'
            ? l.duration
            : parseInt(l?.duration, 10) || 0;
        totalDurationMin += d;
      });
      const courseReviews = (reviews as any)[c.id] || {};
      Object.values(courseReviews).forEach((r: any) => {
        if (r?.rating) {
          ratingSum += r.rating;
          totalReviews += 1;
        }
      });
    });
    const avgRating = totalReviews > 0 ? +(ratingSum / totalReviews).toFixed(1) : 4.8;
    const totalHours = Math.round(totalDurationMin / 60);
    return { total, totalLessons, totalHours, avgRating };
  }, [courses, lessons, reviews]);

  return (
    <div className="min-h-screen bg-[color:var(--ai-background)]">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[420px] -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[480px] h-[480px] bg-[color:var(--ai-primary)]/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-[360px] h-[360px] bg-[color:var(--ai-secondary)]/10 rounded-full blur-3xl" />
      </div>

      <SectionShell
        eyebrow={tHeader('exploreTitle') ?? 'Catalog'}
        title={tHeader('exploreTitle')}
        description={tHeader('description')}
        spacing="md"
        maxWidth="xl"
      >
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Available courses"
            value={stats.total}
            hint="Hand-curated tracks"
            icon={<FiBookOpen className="w-5 h-5" />}
            tone="primary"
          />
          <MetricCard
            label="Lessons"
            value={stats.totalLessons}
            hint={`${stats.totalHours}h of content`}
            icon={<FiAward className="w-5 h-5" />}
            tone="success"
          />
          <MetricCard
            label="Avg rating"
            value={stats.avgRating.toFixed(1)}
            hint="From verified students"
            icon={<FiUsers className="w-5 h-5" />}
            tone="warning"
          />
          <MetricCard
            label="Always learning"
            value="24/7"
            hint="Lifetime access included"
            icon={<FiAward className="w-5 h-5" />}
            tone="danger"
          />
        </div>

        {/* Subscription banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <GradientCard tone="primary" glow flush className="overflow-hidden">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at top right, color-mix(in srgb, var(--ai-primary) 18%, transparent), transparent 60%)',
                }}
              />
              <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                <div className="shrink-0 grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg shadow-[color:var(--ai-primary)]/30 text-white">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] text-[11px] font-semibold uppercase tracking-wider">
                    {t('badge')}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                    {t('title')}
                  </h3>
                  <p className="text-[color:var(--ai-muted)] text-sm md:text-base mb-4 max-w-2xl">
                    {t('description')}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-[color:var(--ai-foreground)]">
                    {[t('benefit1'), t('benefit2'), t('benefit3')].map((b) => (
                      <span key={b} className="inline-flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[color:var(--ai-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/subscriptions"
                  className="shrink-0 inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-semibold shadow-lg shadow-[color:var(--ai-primary)]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                >
                  {t('cta')}
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </GradientCard>
        </motion.div>

        {/* Filters */}
        <CoursesFilter
          onFilterChange={setFilter}
          onCategoryChange={setCategory}
          currentFilter={filter}
          currentCategory={category}
        />

        {/* Course grid */}
        <CoursesList filter={filter} category={category} />
      </SectionShell>
    </div>
  );
}
