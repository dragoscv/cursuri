'use client';

import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { collectionGroup, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ro as roLocale, enUS as enLocale } from 'date-fns/locale';

import { AppContext } from '@/components/AppContext';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import type { Course, Lesson } from '@/types';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';

type LatestLesson = Lesson & {
  courseId: string;
  createdAt?: string;
};

const MAX_LESSONS = 50;

function parseCreatedAt(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp shape
  if (typeof value === 'object' && value !== null && 'toDate' in (value as any)) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

const LatestLessonsSection = React.memo(function LatestLessonsSection() {
  const t = useTranslations('home.latestLessons');
  const tRecommended = useTranslations('home.recommendedCourses');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const context = useContext(AppContext);

  const courses = context?.courses || {};
  const products = context?.products || [];
  const userPaidProducts = context?.userPaidProducts || [];
  const subscriptions = context?.subscriptions || [];

  const [latestLessons, setLatestLessons] = useState<LatestLesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Active subscription = any active/trialing in subscriptions list
  const hasActiveSubscription = useMemo(
    () => Array.isArray(subscriptions) && subscriptions.length > 0,
    [subscriptions]
  );

  // Fast lookup of owned courseIds (lifetime / one-time purchases)
  const ownedCourseIds = useMemo(
    () => new Set(userPaidProducts.map((p) => p.metadata?.courseId).filter(Boolean)),
    [userPaidProducts]
  );

  // Fetch latest lessons via collectionGroup query (one-shot)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = query(
          collectionGroup(firestoreDB, 'lessons'),
          orderBy('createdAt', 'desc'),
          limit(MAX_LESSONS)
        );
        const snap = await getDocs(q);
        const items: LatestLesson[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as Lesson & { createdAt?: string; status?: string };
          // Skip drafts when status is present
          if (data.status && data.status !== 'active' && data.status !== 'published') return;
          const courseId = doc.ref.parent.parent?.id;
          if (!courseId) return;
          items.push({ ...(data as Lesson), id: doc.id, courseId });
        });
        if (!cancelled) setLatestLessons(items);
      } catch (err) {
        console.error('[LatestLessonsSection] Failed to fetch latest lessons:', err);
        if (!cancelled) setLatestLessons([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dateLocale = locale === 'ro' ? roLocale : enLocale;

  // Recommended courses (mirror of RecommendedCoursesSection logic, sliced for sidebar)
  const recommendedCourses = useMemo(() => {
    const allCourses = Object.values(courses) as Course[];
    const enrolledIds = Array.from(ownedCourseIds);
    const notEnrolled = allCourses.filter((c) => !enrolledIds.includes(c.id));

    // Build user interests from owned courses' tags
    const interests = new Set<string>();
    enrolledIds.forEach((id) => {
      const c = courses[id as string];
      c?.tags?.forEach((tag: string) => interests.add(tag));
    });

    if (interests.size > 0) {
      return notEnrolled
        .map((course) => ({
          course,
          match: course.tags ? course.tags.filter((tg) => interests.has(tg)).length : 0,
        }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 4)
        .map((x) => x.course);
    }

    return notEnrolled
      .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
      .slice(0, 4);
  }, [courses, ownedCourseIds]);

  const handleLessonClick = useCallback(
    (lesson: LatestLesson) => {
      const course = courses[lesson.courseId];
      const courseSlugOrId = course?.slug || lesson.courseId;
      const hasAccess =
        hasActiveSubscription || ownedCourseIds.has(lesson.courseId) || lesson.isFree;

      if (hasAccess) {
        router.push(`/courses/${courseSlugOrId}/lessons/${lesson.id}`);
      } else {
        router.push(`/courses/${courseSlugOrId}`);
      }
    },
    [courses, hasActiveSubscription, ownedCourseIds, router]
  );

  // Don't render section if no data is available at all
  if (!loading && latestLessons.length === 0 && recommendedCourses.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--ai-foreground)]">
            {t('title')}
          </h2>
          <p className="mt-3 text-[color:var(--ai-muted)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Latest Lessons (left, 2 cols on desktop) */}
          <div className="lg:col-span-2 order-1">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)]">
                {t('lessonsHeading')}
              </h3>
              <span className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)]">
                {t('newestFirst')}
              </span>
            </div>

            <div className="relative rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] overflow-hidden shadow-sm">
              {/* Top fade shadow */}
              <div
                className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10 bg-gradient-to-b from-[color:var(--ai-card-bg)] to-transparent"
                aria-hidden="true"
              />
              {/* Bottom fade shadow */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10 bg-gradient-to-t from-[color:var(--ai-card-bg)] to-transparent"
                aria-hidden="true"
              />

              <div className="max-h-[640px] overflow-y-auto custom-scrollbar divide-y divide-[color:var(--ai-card-border)]">
                {loading ? (
                  <ul className="p-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <li
                        key={i}
                        className="flex gap-4 p-3 animate-pulse"
                      >
                        <div className="h-16 w-24 rounded-lg bg-[color:var(--ai-muted)]/10 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-[color:var(--ai-muted)]/10" />
                          <div className="h-3 w-1/2 rounded bg-[color:var(--ai-muted)]/10" />
                          <div className="h-3 w-1/3 rounded bg-[color:var(--ai-muted)]/10" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : latestLessons.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[color:var(--ai-muted)]">
                    {t('empty')}
                  </div>
                ) : (
                  <ul>
                    {latestLessons.map((lesson) => {
                      const course = courses[lesson.courseId];
                      const createdAtDate = parseCreatedAt(lesson.createdAt);
                      const timeAgo = createdAtDate
                        ? formatDistanceToNow(createdAtDate, {
                            addSuffix: true,
                            locale: dateLocale,
                          })
                        : null;
                      const hasAccess =
                        hasActiveSubscription ||
                        ownedCourseIds.has(lesson.courseId) ||
                        lesson.isFree;
                      const lessonName = lesson.name || lesson.title || 'Untitled lesson';
                      const lessonDesc = lesson.description || '';
                      const thumb = lesson.thumbnail || lesson.thumbnailUrl || course?.imageUrl;

                      return (
                        <li key={`${lesson.courseId}-${lesson.id}`}>
                          <button
                            type="button"
                            onClick={() => handleLessonClick(lesson)}
                            className="group w-full text-left flex gap-4 p-3 sm:p-4 cursor-pointer transition-colors hover:bg-[color:var(--ai-primary)]/5 focus:outline-none focus-visible:bg-[color:var(--ai-primary)]/8"
                          >
                            <div className="relative h-16 w-24 sm:h-20 sm:w-32 flex-shrink-0 rounded-lg overflow-hidden bg-[color:var(--ai-muted)]/10">
                              {thumb ? (
                                <Image
                                  src={thumb}
                                  alt={lessonName}
                                  fill
                                  sizes="128px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[color:var(--ai-primary)]/40">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              )}
                              {!hasAccess && (
                                <div className="absolute top-1 right-1 rounded-full bg-black/55 backdrop-blur-sm p-1 text-white">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm sm:text-base font-semibold text-[color:var(--ai-foreground)] group-hover:text-[color:var(--ai-primary)] transition-colors line-clamp-1">
                                  {lessonName}
                                </h4>
                              </div>
                              {lessonDesc && (
                                <p className="mt-1 text-xs sm:text-sm text-[color:var(--ai-muted)] line-clamp-2 leading-relaxed">
                                  {lessonDesc}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--ai-muted)]">
                                {course?.name && (
                                  <span className="inline-flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    </svg>
                                    <span className="truncate max-w-[180px] text-[color:var(--ai-foreground)]/70">
                                      {course.name}
                                    </span>
                                  </span>
                                )}
                                {timeAgo && (
                                  <span className="inline-flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {timeAgo}
                                  </span>
                                )}
                                {!hasAccess && (
                                  <span className="ml-auto text-[10px] uppercase tracking-wider font-medium text-[color:var(--ai-primary)]">
                                    {t('subscribeToWatch')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Courses sidebar */}
          <aside className="lg:col-span-1 order-2">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)]">
                {tRecommended('title')}
              </h3>
            </div>

            {recommendedCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--ai-card-border)] p-6 text-center text-sm text-[color:var(--ai-muted)]">
                {t('noRecommendations')}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recommendedCourses.map((course) => {
                  const priceInfo = getUnifiedCoursePrice(course, products);
                  const href = `/courses/${course.slug || course.id}`;
                  return (
                    <Link
                      key={course.id}
                      href={href}
                      className="group flex flex-col rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40 hover:shadow-lg hover:shadow-[color:var(--ai-primary)]/5 transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <Image
                          src={course.imageUrl || '/placeholder-course.svg'}
                          alt={course.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-[color:var(--ai-foreground)] group-hover:text-[color:var(--ai-primary)] transition-colors line-clamp-2">
                          {course.name}
                        </h4>
                        {course.description && (
                          <p className="mt-1.5 text-xs text-[color:var(--ai-muted)] line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-[color:var(--ai-foreground)]">
                            {course.isFree ? (
                              <span className="text-[color:var(--ai-success)]">
                                {tCommon('status.free')}
                              </span>
                            ) : (
                              <span>
                                {priceInfo.amount} {priceInfo.currency}
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-medium text-[color:var(--ai-primary)] group-hover:translate-x-0.5 transition-transform">
                            {tCommon('viewDetails')} &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
});

export default LatestLessonsSection;
