'use client';

import React, { useContext, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '../AppContext';
import { Spinner } from '@heroui/react';
import CourseDetailView from './CourseDetailView';
import { generateCourseStructuredData } from '@/utils/metadata';

export default function CourseDetail({ courseId }: { courseId: string }) {
  const t = useTranslations('courses');
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('CourseDetail must be used within an AppContextProvider');
  }
  const { courses, userPaidProducts, lessons, isAdmin, fetchCourseById, fetchLessonsForCourse } =
    context;

  // Track if lessons have been fetched to avoid infinite loop
  const lessonsFetched = React.useRef(false);

  // Fetch course data if not available
  useEffect(() => {
    if (courseId) {
      const shouldFetchCourse = !courses || !courses[courseId];
      if (shouldFetchCourse) {
        fetchCourseById(courseId);
      }
    }
  }, [courseId, fetchCourseById, courses]);

  // Separate useEffect for lessons to avoid dependency loops
  useEffect(() => {
    if (courseId) {
      const hasNoLessons =
        !lessons ||
        !lessons[courseId] ||
        (lessons[courseId] && Object.keys(lessons[courseId]).length === 0);

      if (hasNoLessons && !lessonsFetched.current) {
        lessonsFetched.current = true;
        fetchLessonsForCourse(courseId);
      }
    }
  }, [courseId, fetchLessonsForCourse, lessons]);

  const course = courses ? courses[courseId] : null;

  // Get lessons for this course from context
  const courseLessons =
    lessons && courseId && lessons[courseId]
      ? (() => {
        const lessonsData = lessons[courseId];

        // Handle the case where lessons data might be nested
        if (Array.isArray(lessonsData)) {
          // If it's already an array, filter out non-lesson items
          return lessonsData.filter(
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
        } else if (lessonsData && typeof lessonsData === 'object') {
          // Check if this is the nested structure {data: ..., metadata: ...}
          if ('data' in lessonsData && 'metadata' in lessonsData) {
            return Object.values(lessonsData.data);
          } else {
            // This is a direct lesson object structure {lessonId: lesson, lessonId2: lesson2, ...}
            const allValues = Object.values(lessonsData);

            // Filter to only include actual lesson objects (not strings or other data)
            return allValues.filter(
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
          }
        }

        return [];
      })()
      : [];

  // Check if the course has been purchased
  const isPurchased = userPaidProducts?.some((product) => product.metadata?.courseId === courseId);

  // Check if course is free
  const isFree = course?.isFree === true;

  // Separate access logic: admins can VIEW content but shouldn't show as "enrolled"
  // Only show enrollment UI if actually purchased or course is free
  const hasAccess = isPurchased || isFree || isAdmin; // Add structured data
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
    />
  );
}
