'use client';

import React, { useContext, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '../AppContext';
import { Spinner } from '@heroui/react';
import CourseDetailView from './CourseDetailView';
import { generateCourseStructuredData } from '@/utils/metadata';
import { useSearchParams } from 'next/navigation';
import { logCoursePurchase } from '@/utils/analytics';
import { incrementCourseEnrollments, incrementUserCourseCount, trackRevenue } from '@/utils/statistics';

export default function CourseDetail({ courseId }: { courseId: string }) {
  const t = useTranslations('courses');
  const context = useContext(AppContext);
  const searchParams = useSearchParams();

  if (!context) {
    throw new Error('CourseDetail must be used within an AppContextProvider');
  }
  const {
    courses,
    userPaidProducts,
    lessons,
    lessonProgress,
    isAdmin,
    fetchCourseById,
    fetchLessonsForCourse,
    user,
    subscriptions,
  } = context;

  // Track course purchase success after Stripe payment
  useEffect(() => {
    const status = searchParams?.get('status');

    if (status === 'success' && user && courseId) {
      // Get data from URL params (most reliable)
      const courseNameFromUrl = searchParams?.get('courseName');
      const amountFromUrl = searchParams?.get('amount');
      const currencyFromUrl = searchParams?.get('currency');

      if (courseNameFromUrl && amountFromUrl && currencyFromUrl) {
        const courseName = decodeURIComponent(courseNameFromUrl);
        const amount = parseFloat(amountFromUrl);
        const currency = currencyFromUrl.toUpperCase();

        // Generate transaction ID
        const transactionId = `course_${user.uid}_${Date.now()}`;

        // Track purchase in Firebase Analytics
        logCoursePurchase(courseId, courseName, amount, currency, transactionId);

        // Update database statistics
        incrementCourseEnrollments(courseId).catch(error => {
          console.error('Failed to increment course enrollments:', error);
        });

        incrementUserCourseCount(user.uid).catch(error => {
          console.error('Failed to increment user course count:', error);
        });

        // Track revenue
        trackRevenue(amount, currency, 'course', transactionId).catch(error => {
          console.error('Failed to track revenue:', error);
        });

        // Clear URL params after tracking
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
        }, 2000);
      } else {
        console.warn('[CourseDetail] Cannot track purchase - missing URL params');
      }
    } else if (status === 'cancel') {
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, user, courseId]);

  // Fetch course data if not available
  useEffect(() => {
    if (courseId) {
      const shouldFetchCourse = !courses || !courses[courseId];
      if (shouldFetchCourse) {
        fetchCourseById(courseId);
      }
    }
  }, [courseId, fetchCourseById, courses]);

  // Always fetch fresh lessons on mount to ensure latest order
  useEffect(() => {
    if (courseId) {
      // Force fresh fetch by clearing cache to get latest order
      fetchLessonsForCourse(courseId, {
        persist: false,
        cacheKey: `lessons_${courseId}_${Date.now()}`,
      });
    }
    // Only run on mount and when courseId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const course = courses ? courses[courseId] : null;

  // Get lessons for this course from context
  const courseLessons =
    lessons && courseId && lessons[courseId]
      ? (() => {
        const lessonsData = lessons[courseId];

        // Handle the case where lessons data might be nested
        if (Array.isArray(lessonsData)) {
          // If it's already an array, filter out non-lesson items
          const filtered = lessonsData.filter(
            (item: any) =>
              item &&
              typeof item === 'object' &&
              (item.name ||
                item.title ||
                item.description ||
                item.file ||
                item.order !== undefined) &&
              !(item.timestamp && item.expiresAt)
          );
          return filtered;
        } else if (lessonsData && typeof lessonsData === 'object') {
          // Check if this is the nested structure {data: ..., metadata: ...}
          if ('data' in lessonsData && 'metadata' in lessonsData) {
            const extracted = Object.values(lessonsData.data);
            return extracted;
          } else {
            // This is a direct lesson object structure {lessonId: lesson, lessonId2: lesson2, ...}
            const allValues = Object.values(lessonsData);

            // Filter to only include actual lesson objects (not strings or other data)
            const filtered = allValues.filter(
              (item: any) =>
                item &&
                typeof item === 'object' &&
                !Array.isArray(item) &&
                (item.name ||
                  item.title ||
                  item.description ||
                  item.file ||
                  item.order !== undefined ||
                  item.id)
            );
            return filtered;
          }
        }

        return [];
      })()
      : [];

  // Check if the course has been purchased
  const isPurchased = userPaidProducts?.some((product) => product.metadata?.courseId === courseId);

  // Check if user has active subscription (grants access to all courses)
  const hasActiveSubscription = subscriptions && subscriptions.length > 0;

  // Check if course is free
  const isFree = course?.isFree === true;

  // Separate access logic: admins can VIEW content but shouldn't show as "enrolled"
  // Access granted if: purchased this course OR has active subscription OR course is free OR is admin
  const hasAccess = isPurchased || hasActiveSubscription || isFree || isAdmin;

  // Calculate progress data
  const completedLessons = React.useMemo(() => {
    if (!courseId || !lessonProgress || !lessonProgress[courseId]) {
      return {};
    }
    const courseProgress = lessonProgress[courseId];
    const completed: Record<string, boolean> = {};
    Object.keys(courseProgress).forEach((lessonId) => {
      completed[lessonId] = courseProgress[lessonId]?.isCompleted === true;
    });
    return completed;
  }, [courseId, lessonProgress]);

  const progressPercentage = React.useMemo(() => {
    if (!courseLessons || courseLessons.length === 0) return 0;
    const completedCount = Object.values(completedLessons).filter((c) => c === true).length;
    return Math.round((completedCount / courseLessons.length) * 100);
  }, [courseLessons, completedLessons]);

  // Add structured data
  useEffect(() => {
    if (!course) {
      return undefined; // Early return if no course data
    }

    // Generate structured data
    const structuredData = generateCourseStructuredData({
      title: course.title || course.name || 'Course',
      description: course.description || t('fallbacks.noDescription'),
      instructorName:
        course.instructorName ||
        (typeof course.instructor === 'string' ? course.instructor : course.instructor?.name) ||
        t('fallbacks.cursuriInstructor'),
      updatedAt: course.updatedAt
        ? typeof course.updatedAt === 'string'
          ? course.updatedAt
          : course.updatedAt.toString()
        : undefined,
      createdAt: course.createdAt
        ? typeof course.createdAt === 'string'
          ? course.createdAt
          : course.createdAt.toString()
        : undefined,
      slug: courseId,
      coverImage: course.coverImage || course.imageUrl,
      price: typeof course.price === 'string' ? parseFloat(course.price) : course.price,
      rating: typeof course.rating === 'string' ? parseFloat(course.rating) : course.rating,
      ratingCount: course.reviewCount,
      lessons: courseLessons
        .filter((lesson) => lesson !== null && lesson !== undefined) // Filter out null/undefined lessons
        .map((lesson) => ({
          title: lesson?.title || lesson?.name || t('fallbacks.unnamedLesson'),
          duration:
            typeof lesson?.duration === 'string'
              ? parseInt(lesson.duration)
              : lesson?.duration || 0,
        })),
    });

    // Create script element for structured data
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = structuredData;

    // Remove any existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((s) => s.remove());

    // Add script to head
    document.head.appendChild(script); // Cleanup on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, [course, courseId, courseLessons]);

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <CourseDetailView
      course={course}
      courseId={courseId}
      courseLessons={courseLessons}
      hasAccess={hasAccess}
      isAdmin={isAdmin}
      isPurchased={isPurchased}
      hasActiveSubscription={hasActiveSubscription}
      completedLessons={completedLessons}
      progressPercentage={progressPercentage}
    />
  );
}
