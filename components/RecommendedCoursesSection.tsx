'use client';
import React, { useContext, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from './AppContext';
import { useToast } from '@/components/Toast/ToastContext';
import { Course } from '@/types';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { FiLink } from './icons/FeatherIcons/FiLink';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';
import Image from 'next/image';
import Link from 'next/link';

const RecommendedCoursesSection = React.memo(function RecommendedCoursesSection() {
  const t = useTranslations('home.recommendedCourses');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  const router = useRouter();
  const { showToast } = useToast();
  const user = context?.user;
  const courses = context?.courses || {};
  const products = context?.products || [];
  const userPaidProducts = context?.userPaidProducts || [];

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

  // Get IDs of courses the user is already enrolled in
  const enrolledCourseIds = useMemo(
    () => userPaidProducts.map((p) => p.metadata?.courseId),
    [userPaidProducts]
  );

  // Collect tags/categories from enrolled courses as user interests
  const userInterests = useMemo(() => {
    if (!enrolledCourseIds.length) return [];
    const tags = new Set<string>();
    enrolledCourseIds.forEach((id) => {
      const course = courses[id];
      if (course?.tags) course.tags.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags);
  }, [enrolledCourseIds, courses]);

  // Recommend courses not enrolled, sorted by tag/category match, fallback to popular
  const recommendedCourses = useMemo(() => {
    const allCourses = Object.values(courses) as Course[];
    // Exclude already enrolled, and exclude empty drafts (no price AND no
    // lessons) to avoid promoting unfinished placeholder courses on the
    // landing page.
    const notEnrolled = allCourses.filter((c) => {
      if (enrolledCourseIds.includes(c.id)) return false;
      const priceInfo = getUnifiedCoursePrice(c, products);
      const hasPrice = (priceInfo?.amount ?? 0) > 0;
      const hasLessons = typeof c.lessonsCount === 'number' && c.lessonsCount > 0;
      if (!hasPrice && !hasLessons) return false;
      return true;
    });
    if (userInterests.length) {
      // Sort by number of matching tags
      return notEnrolled
        .map((course) => ({
          course,
          match: course.tags ? course.tags.filter((t) => userInterests.includes(t)).length : 0,
        }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 3)
        .map((x) => x.course);
    }
    // Fallback: top 3 by reviews count
    return notEnrolled
      .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
      .slice(0, 3);
  }, [courses, enrolledCourseIds, userInterests, products]);

  // Social share handler
  const handleShare = (course: Course) => {
    const shareUrl = `${window.location.origin}/courses/${course.id}`;
    const shareText = `Check out the course "${course.name}" on StudiAI!`;
    if (navigator.share) {
      navigator.share({
        title: course.name,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast({
        type: 'success',
        title: 'Link Copied',
        message: 'Course link copied to clipboard!',
        duration: 3000,
      });
    }
  };

  if (!recommendedCourses.length) return null;

  return (
    <section className="w-full py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--ai-foreground)]">
            {t('title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course, index) => {
            const { amount, currency } = getCoursePrice(course);
            return (
              <div
                key={course.id}
                className="group flex flex-col rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40 hover:shadow-xl hover:shadow-[color:var(--ai-primary)]/5 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="relative h-48 w-full overflow-hidden"
                >
                  <Link href={`/courses/${course.slug || course.id}`} className="block h-full">
                    <Image
                      src={course.imageUrl || '/placeholder-course.svg'}
                      alt={course.name}
                      fill
                      priority={index < 3}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </Link>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <Link
                    href={`/courses/${course.slug || course.id}`}
                    className="mb-2 text-lg font-semibold text-[color:var(--ai-foreground)] hover:text-[color:var(--ai-primary)] transition-colors line-clamp-2"
                  >
                    {course.name}
                  </Link>
                  <p className="mb-4 flex-1 text-sm text-[color:var(--ai-muted)] line-clamp-2 leading-relaxed">
                    {course.description || ''}
                  </p>
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[color:var(--ai-primary)]/8 text-[color:var(--ai-primary)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-[color:var(--ai-card-border)]">
                    <div className="text-lg font-bold text-[color:var(--ai-foreground)]">
                      {course.isFree ? (
                        <span className="text-[color:var(--ai-success)]">
                          {tCommon('status.free')}
                        </span>
                      ) : (
                        <span>
                          {amount} {currency}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/courses/${course.slug || course.id}`}
                      className="text-sm font-medium text-[color:var(--ai-primary)] hover:underline"
                    >
                      {tCommon('viewDetails')} &rarr;
                    </Link>
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

export default RecommendedCoursesSection;
