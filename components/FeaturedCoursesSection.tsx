'use client';

import React, { useContext, useMemo, useCallback } from 'react';
import { AppContext } from './AppContext';
import { Course } from '@/types';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';

// Show top N most popular or highest-rated courses
const FEATURED_COUNT = 3;

const FeaturedCoursesSection = React.memo(function FeaturedCoursesSection() {
  const context = useContext(AppContext);
  const router = useRouter();
  const courses = context?.courses || {};
  const products = context?.products || [];

  // Use unified pricing logic
  const getCoursePrice = useCallback((course: any) => {
    const priceInfo = getUnifiedCoursePrice(course, products);
    return {
      amount: priceInfo.amount,
      currency: priceInfo.currency,
      priceId: priceInfo.priceId
    };
  }, [products]);

  // Sort by enrollments (popularity) or rating if available
  const featuredCourses = useMemo(() => {
    const courseArr = Object.values(courses) as Course[];
    // Prefer courses with most enrollments, fallback to rating, then random
    return courseArr
      .sort((a, b) => {
        const aEnroll = a.reviews?.length || 0;
        const bEnroll = b.reviews?.length || 0;
        if (bEnroll !== aEnroll) return bEnroll - aEnroll;
        const aRating = a.reviews && a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / a.reviews.length : 0;
        const bRating = b.reviews && b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / b.reviews.length : 0;
        return bRating - aRating;
      })
      .slice(0, FEATURED_COUNT);
  }, [courses]);

  if (!featuredCourses.length) return null;

  return (
    <section className="w-full py-16 bg-gradient-to-b from-[color:var(--ai-primary)]/5 to-transparent">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-[color:var(--ai-foreground)]">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => {
            const { amount, currency } = getCoursePrice(course);
            return (
              <div
                key={course.id}
                className="flex flex-col rounded-xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] shadow-lg border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="relative h-44 w-full cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <img
                    src={course.imageUrl || '/placeholder-course.svg'}
                    alt={course.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('placeholder-course.svg')) {
                        target.src = '/placeholder-course.svg';
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-3 py-1 rounded-lg">
                    {course.difficulty || 'Intermediate'}
                  </div>
                  {/* Featured badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/90 text-xs font-semibold text-yellow-900 shadow">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                      Featured
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h3
                    className="mb-2 text-lg font-bold text-[color:var(--ai-foreground)] cursor-pointer hover:text-[color:var(--ai-primary)] transition-colors"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    {course.name}
                  </h3>
                  <p className="mb-4 text-sm text-[color:var(--ai-muted)] line-clamp-2">
                    {course.description || ''}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {course.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-[color:var(--ai-foreground)]">
                      {course.isFree ? <span className="text-[color:var(--ai-success)] dark:text-[color:var(--ai-success)]">Free</span> : `${amount} ${currency}`}
                    </span>
                    <Button color="primary" onClick={() => router.push(`/courses/${course.id}`)} className="rounded-full px-4">
                      View
                    </Button>
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

