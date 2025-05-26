import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { constructMetadata } from '@/utils/metadata';
import { generateLessonStructuredData, generateBreadcrumbStructuredData } from '@/utils/structuredData';
import { getCourseById, getLessonById, getCourseLessons } from '@/utils/firebase/server';
import { Course, Lesson, PageParams } from '@/types';
import { safeToISOString } from '@/utils/timeHelpers';
import LessonNotFound from '@/components/Lesson/LessonNotFound';

// Import the client component wrapper for lesson detail
import ClientLessonWrapper from '@/components/Lesson/ClientLessonWrapper';

// Generate metadata dynamically for each lesson
export async function generateMetadata({
  params
}: PageParams<{ courseId: string; lessonId: string }>): Promise<Metadata> {
  try {
    // Await params if it's a promise
    const resolvedParams = 'then' in params ? await params : params;
    const courseId = String(resolvedParams.courseId);
    const lessonId = String(resolvedParams.lessonId);

    console.log("[generateMetadata] Resolved params - courseId:", courseId, "lessonId:", lessonId);

    // Fetch course and lesson data
    const course = await getCourseById(courseId) as Course;
    const lesson = await getLessonById(courseId, lessonId) as Lesson;

    if (!course || !lesson) {
      return {
        title: 'Lesson Not Found',
        description: 'The requested lesson could not be found.',
      };
    }

    const instructorName = typeof course.instructor === 'string'
      ? course.instructor
      : course.instructor?.name || 'Cursuri Instructor';

    return constructMetadata({
      title: `${lesson.title || lesson.name} | ${course.name}`,
      description: lesson.description || `Learn ${lesson.title || lesson.name} in ${course.name}`,
      keywords: [
        course.name,
        lesson.title || lesson.name,
        instructorName,
        'online course',
        'lesson',
        'learning',
        'education',
      ],
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${courseId}/lessons/${lessonId}`,
      type: 'lesson',
      publishedTime: undefined, // lesson.createdAt is not in the type
      modifiedTime: lesson.lastModified ? new Date(lesson.lastModified).toISOString() : undefined,
      // Don't allow indexing of individual lessons if they're paid content
      robots: lesson.isFree
        ? { index: true, follow: true }
        : { index: false, follow: true, googleBot: { index: false, follow: true } }
    });
  } catch (error) {
    console.error('Error generating lesson metadata:', error);
    return {
      title: 'Course Lesson',
      description: 'View this lesson content and continue your learning journey.'
    };
  }
}

export default async function Page({
  params
}: PageParams<{ courseId: string; lessonId: string }>) {
  // For server components, we can fetch data to generate structured data
  try {
    // Await params if it's a promise
    const resolvedParams = 'then' in params ? await params : params;
    const courseId = String(resolvedParams.courseId);
    const lessonId = String(resolvedParams.lessonId);

    console.log("Extracted courseId:", courseId, "lessonId:", lessonId);

    // Get course data
    const course = await getCourseById(courseId) as Course;

    if (!course) {
      return <LessonNotFound courseId={courseId} lessonId={lessonId} courseExists={false} />;
    }

    // Try to get the specific lesson
    let lesson = await getLessonById(courseId, lessonId) as Lesson;

    // If lesson not found on first try, attempt to load all lessons to see if it's among them
    if (!lesson) {
      console.log("Lesson not found, trying to load all course lessons");

      // Load all course lessons
      const allLessons = await getCourseLessons(courseId);

      // Check if our target lesson is among them
      if (allLessons && allLessons[lessonId]) {
        console.log("Found lesson in course lessons collection");
        lesson = allLessons[lessonId] as Lesson;
      } else {
        console.log("No such lesson exists even after loading all lessons!");
        return <LessonNotFound courseId={courseId} lessonId={lessonId} courseExists={true} />;
      }
    }

    // At this point we have a lesson
    // Generate URLs for structured data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cursuri.com';
    const courseUrl = `${siteUrl}/courses/${courseId}`;
    const lessonUrl = `${courseUrl}/lessons/${lessonId}`;

    // Get instructor name
    const instructorName = typeof course.instructor === 'string'
      ? course.instructor
      : course.instructor?.name || 'Cursuri Instructor';

    const courseData = {
      title: course.name,
      description: course.description || '',
      instructorName,
      slug: course.id,
      createdAt: safeToISOString(course.createdAt),
      updatedAt: safeToISOString(course.updatedAt)
    };

    // Generate structured data for the lesson
    const lessonStructuredData = generateLessonStructuredData(
      lesson,
      courseData,
      courseUrl,
      lessonUrl
    );

    // Generate breadcrumb structured data
    const breadcrumbStructuredData = generateBreadcrumbStructuredData([
      {
        name: "Home",
        url: siteUrl,
        position: 1
      },
      {
        name: "Courses",
        url: `${siteUrl}/courses`,
        position: 2
      },
      {
        name: course.name,
        url: courseUrl,
        position: 3
      },
      {
        name: lesson.title || lesson.name,
        url: lessonUrl,
        position: 4
      }
    ]);

    // Return the lesson detail with structured data
    return (
      <>
        {/* Add JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: lessonStructuredData }}
        />

        {/* Add breadcrumb structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbStructuredData }}
        />        {/* Render the lesson component with explicit string params */}
        <ClientLessonWrapper params={{
          courseId: String(courseId),
          lessonId: String(lessonId)
        }} />
      </>
    );
  } catch (error) {
    console.error('Error rendering lesson page:', error);    // Fallback if data fetch fails - ensure we pass resolved params
    try {
      // Get params again since we might be in the error catch block
      console.log("Using fallback path");      // Handle params safely in the fallback path
      const resolvedParamsFallback = 'then' in params ? await params : params;
      const courseIdFallback = resolvedParamsFallback ? String(resolvedParamsFallback.courseId) : '';
      const lessonIdFallback = resolvedParamsFallback ? String(resolvedParamsFallback.lessonId) : '';

      console.log("Fallback params - courseId:", courseIdFallback, "lessonId:", lessonIdFallback);

      // First check if the course exists
      const courseFallback = await getCourseById(courseIdFallback);

      if (!courseFallback) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="mb-6">The course you're looking for doesn't exist.</p>            <Link
              href="/courses"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        );
      }

      // Then check if the lesson exists
      const lessonExists = await getLessonById(courseIdFallback, lessonIdFallback);

      if (!lessonExists) {
        console.log("No such lesson exists in fallback path!");
        // Return a consistent error message with debugging information
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
            <p className="mb-6">The lesson you're looking for doesn't exist or you may not have access to it.</p>
            <a
              href={`/courses/${courseIdFallback}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Course
            </a>
            {/* Debugging information */}
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-lg w-full">
              <h3 className="font-bold mb-2">Debugging Information:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Course ID: {courseIdFallback}</li>
                <li>Lesson ID: {lessonIdFallback}</li>
                <li>Course Exists: {courseFallback ? 'Yes' : 'No'}</li>
                <li>Course Lessons Loaded: Yes</li>
                <li>Lessons Available: Yes</li>
                <li>Lesson Exists: No</li>
              </ul>
            </div>
          </div>
        );
      }      // If course exists but we had an error, pass the params to the component
      // The component will handle access control and rendering
      return <ClientLessonWrapper params={{
        courseId: courseIdFallback,
        lessonId: lessonIdFallback
      }} />;
    } catch (fallbackError) {
      console.error("Error in fallback path:", fallbackError);      // Last resort fallback - try to extract params directly
      try {
        const lastResortParams = 'then' in params ? await params : params;
        if (lastResortParams && typeof lastResortParams.courseId === 'string' && typeof lastResortParams.lessonId === 'string') {
          return <ClientLessonWrapper params={{
            courseId: lastResortParams.courseId,
            lessonId: lastResortParams.lessonId
          }} />;
        }
      } catch (err) {
        console.error("Error in last resort param extraction:", err);
      }

      // Ultimate fallback - return an error page
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Error Loading Lesson</h1>
          <p className="mb-6">There was a problem loading this lesson. Please try again later.</p>          <Link
            href="/courses"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      );
    }
  }
}