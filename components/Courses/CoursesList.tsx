import React, { useContext, useCallback, memo, useMemo } from 'react';
import { stripHtml } from '@/utils/security/htmlSanitizer';
import { AppContext } from '../AppContext';
import { useToast } from '@/components/Toast/ToastContext';
import { Chip, Progress } from '@heroui/react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LoadingButton from '../Buttons/LoadingButton';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '../Login';
import { Course } from '@/types';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';
import { FiLink } from '../icons/FeatherIcons/FiLink';
import { useTranslations } from 'next-intl';
import { logSearchResultClick, logCourseShare } from '@/utils/analytics';

interface CoursesListProps {
  filter?: string;
  category?: string;
}

export const CoursesList: React.FC<CoursesListProps> = memo(function CoursesList({
  filter,
  category,
}) {
  const t = useTranslations('common');
  const context = useContext(AppContext);
  const { showToast } = useToast();

  if (!context) {
    throw new Error('CoursesList must be used within an AppContextProvider');
  }
  const {
    courses,
    products,
    openModal,
    closeModal,
    userPaidProducts,
    user,
    lessonProgress,
    lessons,
  } = context;
  const [loadingPayment, setLoadingPayment] = React.useState(false);
  const [loadingCourseId, setLoadingCourseId] = React.useState<string | null>(null);

  // Memoize hover animation props — calm border highlight only, no y-lift
  const cardHoverProps = useMemo(
    () => ({
      transition: { duration: 0.2, ease: 'easeOut' as const },
    }),
    []
  );

  // Filter courses based on filter and category props
  const filteredCourses = React.useMemo(() => {
    let result = Object.values(courses || {});

    if (filter) {
      const lowercaseFilter = filter.toLowerCase();
      result = result.filter(
        (course: any) =>
          course.name.toLowerCase().includes(lowercaseFilter) ||
          (course.description && course.description.toLowerCase().includes(lowercaseFilter))
      );
    }

    if (category && category !== 'all') {
      result = result.filter((course: any) => course.tags && course.tags.includes(category));
    }

    // Sort by displayOrder, then by name
    result.sort((a: any, b: any) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });

    return result;
  }, [courses, filter, category]);

  const buyCourse = useCallback(
    async (priceId: string, courseId: string) => {
      if (!user) {
        openModal({
          id: 'login',
          isOpen: true,
          hideCloseButton: false,
          backdrop: 'blur',
          size: 'full',
          scrollBehavior: 'inside',
          isDismissable: true,
          modalHeader: t('buttons.login'),
          modalBody: <Login onClose={() => closeModal('login')} />,
          headerDisabled: true,
          footerDisabled: true,
          noReplaceURL: true,
          onClose: () => closeModal('login'),
        });
        return;
      }

      setLoadingPayment(true);
      setLoadingCourseId(courseId);

      const payments = stripePayments(firebaseApp);
      try {
        const session = await createCheckoutSession(payments, {
          price: priceId,
          allow_promotion_codes: true,
          mode: 'payment',
          metadata: {
            courseId: courseId,
          },
        });
        window.location.assign(session.url);
      } catch (error) {
        console.error('Payment error:', error);
      } finally {
        setLoadingPayment(false);
        setLoadingCourseId(null);
      }
    },
    [closeModal, openModal, user]
  );

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
  const isPurchased = useCallback(
    (courseId: string) => {
      return userPaidProducts?.find(
        (userPaidProduct: any) => userPaidProduct.metadata?.courseId === courseId
      );
    },
    [userPaidProducts]
  );

  // Calculate total duration from lessons
  const getCourseTotalDuration = useCallback(
    (courseId: string) => {
      if (!lessons || !lessons[courseId]) return null;

      const courseLessons = Object.values(lessons[courseId] || {});
      const totalDuration = courseLessons.reduce((total: number, lesson: any) => {
        if (!lesson) return total;

        const durationMins =
          typeof lesson?.duration === 'number' && lesson.duration > 0
            ? lesson.duration
            : typeof lesson?.duration === 'string' &&
                !isNaN(parseInt(lesson.duration, 10)) &&
                parseInt(lesson.duration, 10) > 0
              ? parseInt(lesson.duration, 10)
              : 0;

        return total + durationMins;
      }, 0);

      if (totalDuration === 0) return null;

      const hours = Math.floor(totalDuration / 60);
      const minutes = totalDuration % 60;

      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    },
    [lessons]
  );

  // Calculate course completion percentage
  const getCourseCompletion = useCallback(
    (courseId: string) => {
      if (!lessonProgress || !lessons || !lessons[courseId])
        return { completed: 0, total: 0, percentage: 0 };

      const courseLessons = lessons[courseId] || {};
      const totalLessons = Object.keys(courseLessons).length;
      if (totalLessons === 0) return { completed: 0, total: 0, percentage: 0 };

      const courseProgress = lessonProgress[courseId] || {};
      const completedLessons = Object.values(courseProgress).filter(
        (progress: any) => progress.isCompleted
      ).length;

      const percentage = Math.round((completedLessons / totalLessons) * 100);

      return {
        completed: completedLessons,
        total: totalLessons,
        percentage: percentage,
      };
    },
    [lessonProgress, lessons]
  );

  // Animation variants
  const courseVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Social share handler
  const handleShare = (course: any) => {
    const shareUrl = `${window.location.origin}/courses/${course.id}`;
    const shareText = `Check out the course "${course.name}" on StudiAI!`;

    // Determine share method
    let shareMethod = 'link_copy';

    if (navigator.share) {
      shareMethod = 'web_share_api';
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
        message: t('course.linkCopied'),
        duration: 3000,
      });
    }

    // Track course share
    logCourseShare(course.id, course.name, shareMethod);
  };

  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-[color:var(--ai-foreground)]">
          {t('status.noCourses')}
        </h3>
        <p className="mt-2 text-[color:var(--ai-muted)]">{t('status.tryAdjusting')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredCourses.map((course: any, idx: number) => {
        const { amount, currency, priceId } = getCoursePrice(course);
        const purchased = isPurchased(course.id);
        const isLoading = loadingPayment && loadingCourseId === course.id;
        const totalDuration = getCourseTotalDuration(course.id);

        // Use badges from course data
        const badges: string[] = (course as any).badges || [];

        return (
          <motion.div
            key={course.id}
            id={course.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-foreground)]/40 transition-colors duration-200"
            variants={courseVariants}
            initial="hidden"
            animate="visible"
            whileHover={cardHoverProps}
          >
            <Link
              href={`/courses/${course.slug || course.id}`}
              className="block"
              onClick={() => {
                if (filter || category) {
                  logSearchResultClick(filter || category || 'browse', course.id, idx);
                }
              }}
            >
              <div className="relative overflow-hidden">
                {/* Difficulty pill (top-left) — calm */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-flex items-center h-6 px-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-black/40 backdrop-blur text-white">
                    {course.difficulty || t('difficulty.intermediate')}
                  </span>
                </div>
                {/* Course badges (top-right) — plain text, no emoji */}
                {badges.length > 0 && (
                  <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
                    {badges.slice(0, 2).map((badge: string) => (
                      <span
                        key={badge}
                        className="inline-flex items-center h-6 px-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] bg-amber-500/95 text-amber-950 shadow-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Purchased badge */}
                {purchased && (
                  <div className="absolute bottom-3 right-3 z-20">
                    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] bg-emerald-500/95 text-emerald-950 shadow-sm">
                      <svg
                        className="w-3 h-3"
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
                      {t('status.enrolled')}
                    </span>
                  </div>
                )}

                {/* Course image */}
                <div className="relative h-44 w-full overflow-hidden bg-[color:var(--ai-card-border)]/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                  <img
                    src={
                      course.imageUrl ||
                      products?.find((product: any) => product.id === course.priceProduct?.id)
                        ?.images?.[0] ||
                      '/placeholder-course.svg'
                    }
                    alt={course.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('placeholder-course.svg')) {
                        target.src = '/placeholder-course.svg';
                      }
                    }}
                  />
                  {/* Course info overlays — calm text-only chips */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end gap-2 z-20 text-[11px] font-medium text-white/90">
                    {totalDuration ? (
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {totalDuration}
                      </span>
                    ) : (
                      <span />
                    )}

                    {course.lessonsCount !== undefined && (
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        {course.lessonsCount} {t('course.lessons')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                {/* Course title */}
                <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.01em] text-[color:var(--ai-foreground)] group-hover:text-[color:var(--ai-primary)] transition-colors line-clamp-2">
                  {course.name}
                </h3>

                {/* Course description */}
                <p className="mb-4 flex-1 text-[13px] text-[color:var(--ai-muted)] leading-relaxed line-clamp-2">
                  {course.description ? stripHtml(course.description) : ''}
                </p>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium uppercase tracking-[0.06em] text-[color:var(--ai-muted)] border border-[color:var(--ai-card-border)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-[color:var(--ai-card-border)]/60">
                  {/* Price */}
                  <div className="text-[15px] font-semibold text-[color:var(--ai-foreground)] tabular-nums">
                    {course.isFree ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t('status.free')}
                      </span>
                    ) : (
                      <span>
                        {amount}{' '}
                        <span className="text-[color:var(--ai-muted)] text-[13px] font-medium">
                          {currency}
                        </span>
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors">
                    {purchased ? t('status.enrolled') : t('viewDetails')}
                    <FiLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
});

export default CoursesList;
