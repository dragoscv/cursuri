'use client';

import React, { useContext, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from './AppContext';
import { Course } from '@/types';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';
import Image from 'next/image';

// Show top N most popular or highest-rated courses
const FEATURED_COUNT = 3;

const FeaturedCoursesSection = React.memo(function FeaturedCoursesSection() {
  const t = useTranslations('home.featuredCourses');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  const router = useRouter();
  const courses = context?.courses || {};
  const products = context?.products || [];

  // Use unified pricing logic
  const getCoursePrice = useCallback(
    (course: any) => {
      const priceInfo = getUnifiedCoursePrice(course, products);
      return {
        amount: priceInfo.amount,
        currency: priceInfo.currency,
        priceId: priceInfo.priceId,
      };
    },
    [products]
  );

  // Sort by enrollments (popularity) or rating if available
  const featuredCourses = useMemo(() => {
    const courseArr = Object.values(courses) as Course[];
    // Sort by displayOrder first, then by enrollments/rating
    return courseArr
      .sort((a, b) => {
        const orderA = (a as any).displayOrder ?? 999;
        const orderB = (b as any).displayOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        const aEnroll = a.reviews?.length || 0;
        const bEnroll = b.reviews?.length || 0;
        if (bEnroll !== aEnroll) return bEnroll - aEnroll;
        const aRating =
          a.reviews && a.reviews.length > 0
            ? a.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / a.reviews.length
            : 0;
        const bRating =
          b.reviews && b.reviews.length > 0
            ? b.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / b.reviews.length
            : 0;
        return bRating - aRating;
      })
      .slice(0, FEATURED_COUNT);
  }, [courses]);

  if (!featuredCourses.length) return null;

  return (
    <section className="w-full py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--ai-foreground)]">
            {t('title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => {
            const { amount, currency } = getCoursePrice(course);
            return (
              <div
                key={course.id}
                className="group flex flex-col rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40 hover:shadow-xl hover:shadow-[color:var(--ai-primary)]/5 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="relative h-48 w-full cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/courses/${course.slug || course.id}`)}
                >
                  <Image
                    src={course.imageUrl || '/placeholder-course.svg'}
                    alt={course.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-medium rounded-lg bg-black/50 text-white/90 backdrop-blur-sm">
                    {course.difficulty || 'Intermediate'}
                  </div>
                  {/* Featured badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/90 text-xs font-semibold text-amber-900 shadow-md">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                      Featured
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h3
                    className="mb-2 text-lg font-semibold text-[color:var(--ai-foreground)] cursor-pointer hover:text-[color:var(--ai-primary)] transition-colors line-clamp-2"
                    onClick={() => router.push(`/courses/${course.slug || course.id}`)}
                  >
                    {course.name}
                  </h3>
                  <p className="mb-4 text-sm text-[color:var(--ai-muted)] line-clamp-2 leading-relaxed">
                    {course.description || ''}
                  </p>
                  <div className="flex items-center gap-1.5 mb-4">
                    {course.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[color:var(--ai-primary)]/8 text-[color:var(--ai-primary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[color:var(--ai-card-border)]">
                    <span className="text-lg font-bold text-[color:var(--ai-foreground)]">
                      {course.isFree ? (
                        <span className="text-[color:var(--ai-success)]">
                          {tCommon('status.free')}
                        </span>
                      ) : (
                        `${amount} ${currency}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default FeaturedCoursesSection;
