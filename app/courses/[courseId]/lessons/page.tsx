'use client';
import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../../../components/AppContext';
import LessonsList from '../../../../components/Course/LessonsList';
import { Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { Course, Lesson, UserPaidProduct } from '@/types';
import CourseProgressHeader from '@/components/Lessons/CourseProgressHeader';
import CourseAccessRequired from '@/components/Course/Access/CourseAccessRequired';

// Define the props interface for the page component
interface LessonsPageProps {
  params: { courseId: string } | Promise<{ courseId: string }>;
}

export default function LessonsPage(props: LessonsPageProps) {
  // Unwrap the params using React.use() to handle both Promise and non-Promise cases
  const unwrappedParams = React.use(
    props.params instanceof Promise ? props.params : Promise.resolve(props.params)
  );
  const { courseId } = unwrappedParams;

  const context = useContext(AppContext);

  if (!context) {
    throw new Error('LessonsPage must be used within an AppContextProvider');
  }
  const { courses, lessons, lessonProgress, userPurchases, user } = context;
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Find the course and its associated lessons
  const course = Object.values(courses || {}).find((c: Course) => c.id === courseId);

  // Get all lessons for this course and convert to array
  const courseLessons = lessons[courseId] ? Object.values(lessons[courseId]) : [];

  useEffect(() => {
    console.log('[LessonsPage] useEffect triggered', {
      courseId,
      hasCourseLessons: !!courseLessons && courseLessons.length > 0,
      hasLessonProgress: !!lessonProgress,
      hasCourseProgress: !!lessonProgress?.[courseId],
      courseProgressKeys: lessonProgress?.[courseId] ? Object.keys(lessonProgress[courseId]) : [],
    });

    // Get completed lessons from lessonProgress in context
    if (courseLessons && lessonProgress && lessonProgress[courseId]) {
      const completed = courseLessons.reduce((result: Record<string, boolean>, lesson: Lesson) => {
        const progress = lessonProgress[courseId]?.[lesson.id];
        const isComplete = progress?.isCompleted === true;

        console.log(`[LessonsPage] Lesson ${lesson.id} (${lesson.name}):`, {
          hasProgress: !!progress,
          isCompleted: progress?.isCompleted,
          isComplete,
        });

        result[lesson.id] = isComplete;
        return result;
      }, {});

      console.log('[LessonsPage] Completed lessons:', {
        completedLessons: completed,
        completedCount: Object.values(completed).filter((v) => v === true).length,
        totalCount: courseLessons.length,
      });

      setCompletedLessons(completed);
      setIsLoading(false);
    } else if (courseLessons) {
      console.log('[LessonsPage] No progress data, setting empty completed lessons');
      setCompletedLessons({});
      setIsLoading(false);
    }
  }, [courseLessons, lessonProgress, courseId]);

  // Check if the user has purchased this course
  const hasPurchased = userPurchases
    ? Object.values(userPurchases).some(
        (purchase: UserPaidProduct) => purchase.metadata?.courseId === courseId
      )
    : false;

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // If the user hasn't purchased the course, redirect to the course page
  if (user && !hasPurchased && !course.isFree) {
    return <CourseAccessRequired courseId={courseId} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <CourseProgressHeader
        courseId={courseId}
        courseName={course.name}
        difficulty={course.difficulty || 'All levels'}
        lessonCount={courseLessons?.length || 0}
        completedLessonsCount={
          Object.values(completedLessons).filter((isComplete) => isComplete === true).length
        }
        isLoading={isLoading}
      />{' '}
      <LessonsList
        lessons={courseLessons || []}
        course={course}
        courseId={courseId}
        completedLessons={completedLessons}
        userHasAccess={hasPurchased || course.isFree}
      />
    </motion.div>
  );
}
