'use client';

/**
 * StatisticsSection v2 — editorial KPI strip.
 *
 * Pulls live values from AppContext (course count, total content hours,
 * average review rating). For total students we count unique paying users
 * across the `customers/{uid}/payments` collection group, but only when
 * the viewer is an authenticated admin (the rule set forbids broad reads
 * for anyone else). Falls back to the i18n "value" copy otherwise.
 */

import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { Reveal, Stagger, fadeUp } from '@/components/motion';
import SectionHeading from '@/components/shared/SectionHeading';
import { AppContext } from './AppContext';

const StatisticsSection = memo(function StatisticsSection() {
  const t = useTranslations('home.statistics');
  const ref = useRef<HTMLDivElement | null>(null);
  const context = useContext(AppContext);
  const [isVisible, setIsVisible] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);

  const realStats = useMemo(() => {
    if (!context) return { totalCourses: 0, totalHours: 0, avgRating: '4.8' };

    const { courses = {}, reviews = {}, lessons = {} } = context;
    const totalCourses = Object.keys(courses).length;

    let totalMinutes = 0;
    Object.keys(courses).forEach((courseId: string) => {
      const courseLessons = lessons[courseId];
      if (courseLessons && typeof courseLessons === 'object') {
        Object.values(courseLessons).forEach((lesson: { duration?: number | string }) => {
          if (lesson?.duration) {
            const mins =
              typeof lesson.duration === 'number'
                ? lesson.duration
                : parseInt(lesson.duration, 10) || 0;
            totalMinutes += mins;
          }
        });
      }
    });

    let totalRating = 0;
    let reviewCount = 0;
    Object.values(reviews).forEach((courseReviews: Record<string, { rating?: number }>) => {
      if (courseReviews && typeof courseReviews === 'object') {
        Object.values(courseReviews).forEach((review) => {
          if (review && typeof review.rating === 'number') {
            totalRating += review.rating;
            reviewCount++;
          }
        });
      }
    });
    const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '4.8';

    return {
      totalCourses,
      totalHours: Math.round(totalMinutes / 60),
      avgRating,
    };
  }, [context]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (!context?.user || !context?.isAdmin) return;

    let cancelled = false;
    async function fetchTotalStudents() {
      try {
        const { getFirestore, collectionGroup, query, where, getDocs } =
          await import('firebase/firestore');
        const { firebaseApp } = await import('@/utils/firebase/firebase.config');
        const db = getFirestore(firebaseApp);
        const paymentsQuery = query(
          collectionGroup(db, 'payments'),
          where('status', '==', 'succeeded')
        );
        const snapshot = await getDocs(paymentsQuery);
        const uniqueUserIds = new Set<string>();
        snapshot.forEach((doc) => {
          const parts = doc.ref.path.split('/');
          const idx = parts.indexOf('customers') + 1;
          if (idx > 0 && idx < parts.length && parts[idx]) uniqueUserIds.add(parts[idx]);
        });
        if (!cancelled) setTotalStudents(uniqueUserIds.size);
      } catch (error) {
        console.error('Error fetching total students:', error);
      }
    }
    fetchTotalStudents();
    return () => {
      cancelled = true;
    };
  }, [isVisible, context?.user, context?.isAdmin]);

  const stats = [
    {
      key: 'courses',
      value: realStats.totalCourses > 0 ? `${realStats.totalCourses}+` : t('courses.value'),
      label: t('courses.label'),
      icon: t('courses.icon'),
    },
    {
      key: 'students',
      value: totalStudents > 0 ? `${totalStudents.toLocaleString()}+` : t('students.value'),
      label: t('students.label'),
      icon: t('students.icon'),
    },
    {
      key: 'hours',
      value:
        realStats.totalHours > 0 ? `${realStats.totalHours.toLocaleString()}+` : t('hours.value'),
      label: t('hours.label'),
      icon: t('hours.icon'),
    },
    {
      key: 'rating',
      value: realStats.avgRating,
      label: t('rating.label'),
      icon: t('rating.icon'),
    },
  ];

  return (
    <section ref={ref} className="relative w-full py-24 md:py-32 bg-[color:var(--ai-background)]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal trigger="view" offset={28}>
          <SectionHeading
            eyebrow={t('badge')}
            title={t('title')}
            subtitle={t('description')}
            className="mb-16"
          />
        </Reveal>

        <Stagger gap={0.06} delay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {stats.map((stat) => (
            <motion.div
              key={stat.key}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="group relative rounded-2xl p-7 md:p-8 bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40 transition-colors text-center"
            >
              <span className="text-2xl mb-3 inline-block opacity-80" aria-hidden>
                {stat.icon}
              </span>
              <div className="text-[clamp(2rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] tabular-nums text-[color:var(--ai-foreground)] leading-none">
                {stat.value}
              </div>
              <div className="mt-2 text-[13px] tracking-[0.04em] uppercase text-[color:var(--ai-muted)] font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
});

export default StatisticsSection;
