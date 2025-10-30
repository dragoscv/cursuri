import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Course, ModalProps } from '../../types';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { Button, Progress, Chip, Divider, Card } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  FiShoppingCart,
  FiCheck,
  FiLock,
  FiClock,
  FiBook,
  FiPlayCircle,
  FiAward,
  FiDownload,
  FiArrowRight,
  FiMessageSquare,
  FiLink,
} from '../icons/FeatherIcons';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import Login from '../Login';
import LoadingButton from '../Buttons/LoadingButton';

interface CourseEnrollmentProps {
  course: Course;
  isPurchased: boolean;
  completedLessons?: Record<string, boolean>;
  progressPercentage?: number;
  totalLessons?: number;
  courseLessons?: any[];
}

export const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({
  course,
  isPurchased,
  completedLessons = {},
  progressPercentage = 0,
  totalLessons = 0,
  courseLessons = [],
}) => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('CourseEnrollment must be used within an AppContextProvider');
  }

  const { user, openModal, closeModal } = context;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('courses.enrollment');
  const tCommon = useTranslations('common');

  // Find the first uncompleted lesson
  const getNextLessonUrl = () => {
    if (!courseLessons || courseLessons.length === 0) {
      return `/courses/${course.id}/lessons`;
    }

    // Sort lessons by order
    const sortedLessons = [...courseLessons].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Find first uncompleted lesson
    const firstUncompletedLesson = sortedLessons.find((lesson) => !completedLessons[lesson.id]);

    if (firstUncompletedLesson) {
      return `/courses/${course.id}/lessons/${firstUncompletedLesson.id}`;
    }

    // If all lessons completed, go to first lesson
    return `/courses/${course.id}/lessons/${sortedLessons[0]?.id || ''}`;
  };

  // Check if the user has completed all prerequisites before enrolling
  const checkPrerequisites = () => {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return { passed: true, missingCourses: [] };
    }

    if (!context) {
      return { passed: false, missingCourses: course.prerequisites };
    }

    const { user, userPaidProducts, courses } = context;

    // If no user or no paid products, they can't have completed any prerequisites
    if (!user || !userPaidProducts) {
      return { passed: false, missingCourses: course.prerequisites };
    }

    // Get the list of course IDs the user has purchased
    const userPurchasedCourseIds = userPaidProducts
      .filter((product) => product.metadata?.courseId)
      .map((product) => product.metadata.courseId);

    // Find missing prerequisites - courses that are required but not purchased
    const missingPrerequisites = course.prerequisites.filter(
      (prerequisiteId) => !userPurchasedCourseIds.includes(prerequisiteId)
    );

    // Create a list of missing courses with their names
    const missingCourses = missingPrerequisites.map((id) => {
      const prerequisiteCourse = courses[id];
      return {
        id,
        name: prerequisiteCourse?.name || id,
      };
    });

    return {
      passed: missingPrerequisites.length === 0,
      missingCourses,
    };
  };

  const handleEnrollClick = async () => {
    setIsLoading(true);

    // Check if user is logged in
    if (!user) {
      setIsLoading(false);
      openModal({
        id: 'login-modal',
        isOpen: true,
        modalHeader: t('loginRequired'),
        modalBody: <Login onClose={() => closeModal('login-modal')} />,
        onClose: () => closeModal('login-modal'),
      });
      return;
    }

    // Check prerequisites
    const prerequisiteCheck = checkPrerequisites();
    if (!prerequisiteCheck.passed) {
      setIsLoading(false);

      // Show modal with missing prerequisites
      openModal({
        id: 'prerequisites-modal',
        isOpen: true,
        modalHeader: t('prerequisitesRequired'),
        modalBody: (
          <div className="p-4">
            <p className="mb-4 text-[color:var(--ai-muted)]">{t('prerequisitesDescription')}</p>
            <div className="space-y-2 mb-4">
              {prerequisiteCheck.missingCourses.map((missingCourse: any) => (
                <div
                  key={missingCourse.id}
                  className="flex items-center justify-between p-3 border border-[color:var(--ai-card-border)] rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-[color:var(--ai-primary)]/10 rounded-full mr-3">
                      <FiLock className="text-[color:var(--ai-primary)]" size={16} />
                    </div>
                    <span>{missingCourse.name}</span>
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onClick={() => {
                      context.closeModal('prerequisites-modal');
                      window.location.href = `/courses/${missingCourse.id}`;
                    }}
                  >
                    {t('viewCourse')}
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-sm text-[color:var(--ai-muted)]">{t('completePrerequisites')}</p>
          </div>
        ),
        onClose: () => {},
      });
      return;
    }

    // For paid courses
    if (!course.isFree) {
      try {
        // Use unified pricing to get the correct price ID
        const { products } = context;
        const priceInfo = getUnifiedCoursePrice(course, products);
        const priceId = priceInfo.priceId;

        if (!priceId) {
          console.error('Price ID not found for course:', course.id, priceInfo);
          setIsLoading(false);
          return;
        }

        const payments = stripePayments(firebaseApp);
        const session = await createCheckoutSession(payments, {
          price: priceId,
          allow_promotion_codes: true,
          mode: 'payment',
          metadata: {
            courseId: course.id,
          },
        });
        window.location.assign(session.url);
      } catch (error) {
        console.error('Payment error:', error);
        setIsLoading(false);
      }
    } else {
      // For free courses - direct enrollment logic
      // Logic for enrolling in free courses would go here
      setIsLoading(false);
    }
  };

  // Format price for display using unified pricing logic
  const displayPrice = () => {
    const { products } = context;
    const priceInfo = getUnifiedCoursePrice(course, products);

    if (course.isFree || priceInfo.amount === 0) {
      return t('free');
    }

    return priceInfo.formatted;
  }; // Calculate discount if there's an original price
  const originalPrice =
    typeof course.originalPrice === 'string'
      ? parseFloat(course.originalPrice)
      : course.originalPrice || 0;
  const price = typeof course.price === 'string' ? parseFloat(course.price) : course.price || 0;
  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0; // If user is already enrolled, show an enhanced enrolled view
  if (isPurchased) {
    return (
      <>
        {/* Top success indicator bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[color:var(--ai-success)] via-[color:var(--ai-primary)] to-[color:var(--ai-success)]"></div>

        <div className="p-6">
          {/* Header with status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-[color:var(--ai-success)]/10 p-2 rounded-full">
                <FiCheck className="text-[color:var(--ai-success)]" size={18} />
              </div>
              <h3 className="font-bold text-lg text-[color:var(--ai-foreground)]">
                {t('youreEnrolled')}
              </h3>
            </div>
            <Chip
              color="success"
              variant="flat"
              className="bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] font-medium"
            >
              {t('active')}
            </Chip>
          </div>{' '}
          {/* Progress card */}
          <div className="bg-gradient-to-br from-[color:var(--ai-success)]/10 via-[color:var(--ai-primary)]/5 to-[color:var(--ai-success)]/10 backdrop-blur-sm rounded-xl p-5 border border-[color:var(--ai-success)]/20 shadow-sm hover:shadow-md transition-all duration-300 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[color:var(--ai-foreground)]">
                {t('yourProgress')}
              </span>
              <span className="text-xs bg-[color:var(--ai-success)]/20 text-[color:var(--ai-success)] px-2.5 py-1 rounded-full font-medium">
                {t('inProgress')}
              </span>
            </div>{' '}
            <Progress
              value={progressPercentage}
              color="success"
              className="mb-2 h-2 rounded-full overflow-hidden"
              size="sm"
              aria-label="Course progress"
            />
            <div className="flex justify-between items-center text-xs text-[color:var(--ai-muted)]">
              <span className="font-medium">
                {t('percentComplete', { percent: progressPercentage })}
              </span>
              <span>
                {totalLessons > 0
                  ? t('lessonsProgress', {
                      completed: Object.values(completedLessons).filter((c) => c === true).length,
                      total: totalLessons,
                    })
                  : t('inProgress')}
              </span>
            </div>
          </div>
          {/* Continue button with animation */}{' '}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-xl group">
              {/* Subtle animated glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 blur-lg bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-primary)] transition-opacity duration-500"></div>

              <Button
                color="success"
                className="w-full bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-primary)] py-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-[color:var(--ai-success)]/20 transition-all duration-300 font-semibold"
                size="lg"
                onClick={() => router.push(getNextLessonUrl())}
                endContent={
                  <FiArrowRight className="text-lg ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                }
                startContent={<FiPlayCircle className="text-xl" />}
              >
                {t('continueButton')}
              </Button>
            </div>
          </motion.div>
          <Divider className="my-6" />
          <h4 className="text-sm font-semibold text-[color:var(--ai-foreground)] mb-4">
            {t('whatYouHaveAccess')}
          </h4>{' '}
          {/* Features grid for better visual arrangement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <div className="flex items-center gap-3 text-[color:var(--ai-muted)] group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiBook className="flex-shrink-0" />
              </div>
              <span className="font-medium transition-colors duration-300 group-hover:text-[color:var(--ai-foreground)]">
                {t('lessonsAvailable', { count: course.lessonsCount || '10+' })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[color:var(--ai-muted)] group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiClock className="flex-shrink-0" />
              </div>
              <span className="font-medium transition-colors duration-300 group-hover:text-[color:var(--ai-foreground)]">
                {t('lifetimeAccess')}
              </span>
            </div>

            {course.certificate && (
              <div className="flex items-center gap-3 text-[color:var(--ai-muted)] group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                  <FiAward className="flex-shrink-0" />
                </div>
                <span className="font-medium transition-colors duration-300 group-hover:text-[color:var(--ai-foreground)]">
                  {t('certificateUponCompletion')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-[color:var(--ai-muted)] group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiMessageSquare className="flex-shrink-0" />
              </div>
              <span className="font-medium transition-colors duration-300 group-hover:text-[color:var(--ai-foreground)]">
                {t('premiumSupport')}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Enhanced view for users who are not enrolled yet
  return (
    <>
      {/* Top animated gradient bar */}{' '}
      <div className="h-1.5 w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] background-animate"></div>
      <div className="p-6 bg-gradient-to-br from-[color:var(--ai-card-bg)]/80 via-[color:var(--ai-card-bg)] to-[color:var(--ai-card-bg)]/90 backdrop-blur-sm">
        {/* Price showcase with enhanced styling */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                {displayPrice()}
              </span>

              {course.originalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-[color:var(--ai-muted)] text-lg line-through">
                    {course.originalPrice}
                  </span>
                  <Chip color="danger" size="sm" variant="flat" className="font-medium">
                    {discountPercentage}% {t('off')}
                  </Chip>
                </div>
              )}
            </div>

            {course.limitedOffer && (
              <div className="bg-[color:var(--ai-accent)]/10 text-[color:var(--ai-accent)] text-xs font-medium flex items-center gap-1 py-1.5 px-2.5 rounded-full border border-[color:var(--ai-accent)]/20">
                <FiClock className="animate-pulse" />
                <span>{t('enrollment.limitedTimeOffer')}</span>
              </div>
            )}
          </div>

          {course.moneyBackGuarantee && (
            <div className="flex items-center gap-1.5 text-[color:var(--ai-success)] text-xs font-medium mb-3">
              <FiCheck className="text-[color:var(--ai-success)]" />
              <span>{t('moneyBackGuarantee')}</span>
            </div>
          )}
        </div>

        {/* Enrollment Button with enhanced animations */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {isLoading ? (
            <LoadingButton
              className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] mb-4 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
              loadingText="Processing payment..."
            />
          ) : (
            <div className="relative mb-4 overflow-hidden rounded-xl group">
              {/* Animated corners - more subtle and elegant */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-2 border-l-2 border-[color:var(--ai-primary)]/30 rounded-tl-lg opacity-70 group-hover:border-[color:var(--ai-primary)]/80 transition-colors duration-500"></div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-2 border-r-2 border-[color:var(--ai-secondary)]/30 rounded-br-lg opacity-70 group-hover:border-[color:var(--ai-secondary)]/80 transition-colors duration-500"></div>
              </div>

              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
                <div className="absolute -inset-[200%] animate-[shimmer_5s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transform -translate-x-full group-hover:animate-[shimmer_2s_linear_infinite]"></div>
              </div>

              {/* Enhanced main button */}
              <Button
                color="primary"
                className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] py-6 font-medium text-white transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-[color:var(--ai-primary)]/20 group-hover:bg-gradient-to-r group-hover:from-[color:var(--ai-secondary)] group-hover:via-[color:var(--ai-primary)] group-hover:to-[color:var(--ai-secondary)]"
                size="lg"
                onClick={handleEnrollClick}
                startContent={
                  <div className="relative">
                    {course.isFree ? (
                      <FiCheck className="text-xl" />
                    ) : (
                      <FiShoppingCart className="text-xl transition-transform duration-500 group-hover:rotate-12" />
                    )}
                  </div>
                }
              >
                <span className="relative z-10 tracking-wide font-semibold text-white flex items-center gap-2 transition-all duration-300 group-hover:tracking-wider">
                  {course.isFree ? `${t('enrollButton')} - ${t('free')}` : t('buyNow')}

                  {/* Arrow with enhanced hover animation */}
                  {!course.isFree && (
                    <FiArrowRight className="transition-all duration-500 group-hover:translate-x-1" />
                  )}
                </span>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Features section with enhanced visual hierarchy */}
        <div className="mt-6">
          {/* Course benefits heading with accent line */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"></div>
            <div className="mb-6">
              <h4 className="font-bold text-[color:var(--ai-foreground)]">
                {t('getInstantAccess')}
              </h4>
            </div>
          </div>
          {/* Course features grid */}{' '}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiBook className="flex-shrink-0" />
              </div>
              <span className="text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors duration-300 font-medium">
                {t('lessonsAvailable', { count: course.lessonsCount || '10+' })}
              </span>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiClock className="flex-shrink-0" />
              </div>
              <span className="text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors duration-300 font-medium">
                {t('onDemandVideo')}
              </span>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiPlayCircle className="flex-shrink-0" />
              </div>
              <span className="text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors duration-300 font-medium">
                {t('fullLifetimeAccess')}
              </span>
            </div>

            {course.certificate && (
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                  <FiAward className="flex-shrink-0" />
                </div>
                <span className="text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors duration-300 font-medium">
                  {t('completionCertificate')}
                </span>
              </div>
            )}

            {course.downloadableResources && (
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                  <FiDownload className="flex-shrink-0" />
                </div>
                <span className="text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors duration-300 font-medium">
                  {t('downloadableResources')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 flex items-center justify-center text-[color:var(--ai-primary)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[color:var(--ai-primary)]/20 group-hover:to-[color:var(--ai-secondary)]/20 group-hover:scale-110 shadow-sm">
                <FiMessageSquare className="flex-shrink-0" />
              </div>
              <span className="text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)] transition-colors duration-300 font-medium">
                {t('premiumSupport')}
              </span>
            </div>
          </div>
        </div>

        {/* Prerequisites notice */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-[color:var(--ai-primary)]/5 border border-[color:var(--ai-primary)]/20">
            <div className="flex items-center gap-2 mb-2">
              <FiLink className="text-[color:var(--ai-primary)]" />
              <h3 className="font-medium text-[color:var(--ai-foreground)]">
                {t('prerequisitesRequired')}
              </h3>
            </div>
            <p className="text-sm text-[color:var(--ai-muted)] mb-3">
              {t('completePrerequisites')}
            </p>

            {/* Check prerequisites before enrolling */}
            <div>
              {course.prerequisites.map((prerequisiteId) => {
                const prerequisiteCourse = context.courses?.[prerequisiteId];

                // Check if user has purchased this prerequisite
                const hasPurchased = context.userPaidProducts?.some(
                  (product) => product.metadata?.courseId === prerequisiteId
                );

                return (
                  <div
                    key={prerequisiteId}
                    className={`flex items-center justify-between p-2 rounded-md mb-2 ${
                      hasPurchased
                        ? 'bg-[color:var(--ai-success)]/10 border border-[color:var(--ai-success)]/20'
                        : 'bg-[color:var(--ai-accent)]/10 border border-[color:var(--ai-accent)]/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hasPurchased ? (
                        <FiCheck className="text-[color:var(--ai-success)]" size={16} />
                      ) : (
                        <FiLock className="text-[color:var(--ai-accent)]" size={16} />
                      )}
                      <span className="text-sm">
                        {prerequisiteCourse?.name || `Course ${prerequisiteId}`}
                      </span>
                    </div>
                    {!hasPurchased && (
                      <a
                        href={`/courses/${prerequisiteId}`}
                        className="text-xs px-2 py-1 rounded-full bg-[color:var(--ai-accent)]/20 text-[color:var(--ai-accent)] hover:bg-[color:var(--ai-accent)]/30 transition-colors"
                      >
                        {t('enrollFirst')}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Login prompt for guests with enhanced styling */}
        {!isPurchased && !user && (
          <>
            <Divider className="my-6" />
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 rounded-lg p-4">
              <p className="text-sm text-[color:var(--ai-muted)] mb-3 text-center">
                {t('alreadyHaveAccount')}
              </p>
              <Button
                color="default"
                variant="flat"
                className="w-full bg-[color:var(--ai-card-border)]/20 hover:bg-[color:var(--ai-card-border)]/30 transition-colors"
                onClick={() => {
                  openModal({
                    id: 'login',
                    isOpen: true,
                    modalBody: 'login',
                    modalHeader: tCommon('buttons.login'),
                    headerDisabled: true,
                    footerDisabled: true,
                  });
                }}
              >
                {t('signInToPurchase')}
              </Button>
            </div>{' '}
          </>
        )}
      </div>
    </>
  );
};

export default CourseEnrollment;
