'use client';

/**
 * CoursesPage v2 — calm editorial catalog. Drops the ambient blur blobs,
 * the gradient subscription banner, and the heavy KPI strip in favor of
 * a tight typographic hero, an inline stat row, a flat subscription
 * card with a thin gold accent + ghost CTA, and the filter + grid below.
 */

import React, { useState, useContext, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import CoursesList from './CoursesList';
import CoursesFilter from './CoursesFilter';
import { AppContext } from '@/components/AppContext';
import { FiArrowRight } from '@/components/icons/FeatherIcons';

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
        const d = typeof l?.duration === 'number' ? l.duration : parseInt(l?.duration, 10) || 0;
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Editorial hero */}
        <header className="mb-10 md:mb-14 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--ai-muted)]">
            {tHeader('badge')}
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-[color:var(--ai-foreground)]">
            {tHeader('exploreTitle')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-[color:var(--ai-muted)] leading-relaxed">
            {tHeader('description')}
          </p>

          {/* Inline stat row */}
          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 max-w-2xl">
            <Stat label={tHeader('statCourses')} value={stats.total} />
            <Stat label={tHeader('statLessons')} value={stats.totalLessons} />
            <Stat label={tHeader('statHours')} value={`${stats.totalHours}h`} />
            <Stat label={tHeader('statRating')} value={stats.avgRating.toFixed(1)} />
          </dl>
        </header>

        {/* Subscription card — calm editorial */}
        <section
          aria-label={t('badge')}
          className="relative mb-10 rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm overflow-hidden"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-amber-400 to-amber-500"
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8 pl-7 md:pl-10">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-amber-500">
                {t('badge')}
              </p>
              <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-[-0.01em] text-[color:var(--ai-foreground)]">
                {t('title')}
              </h2>
              <p className="mt-2 text-sm md:text-[15px] text-[color:var(--ai-muted)] leading-relaxed max-w-2xl">
                {t('description')}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[color:var(--ai-foreground)]">
                {[t('benefit1'), t('benefit2'), t('benefit3')].map((b) => (
                  <li key={b} className="inline-flex items-center gap-2">
                    <svg
                      aria-hidden
                      className="w-3.5 h-3.5 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/subscriptions"
              className="group inline-flex items-center justify-center gap-2 self-start md:self-auto h-10 px-5 rounded-full border border-[color:var(--ai-foreground)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)] hover:text-[color:var(--ai-background)] transition-colors text-sm font-semibold cursor-pointer"
            >
              {t('cta')}
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* Filters */}
        <CoursesFilter
          onFilterChange={setFilter}
          onCategoryChange={setCategory}
          currentFilter={filter}
          currentCategory={category}
        />

        {/* Course grid */}
        <CoursesList filter={filter} category={category} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] font-medium text-[color:var(--ai-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tracking-[-0.01em] text-[color:var(--ai-foreground)]">
        {value}
      </dd>
    </div>
  );
}
