import React from 'react';
import { Metadata } from 'next';
import { getCourseById } from '@/utils/firebase/server';
import { constructCourseMetadata } from '@/utils/metadata';
import { generateCourseStructuredData, generateBreadcrumbStructuredData } from '@/utils/structuredData';
import dynamic from 'next/dynamic';

// Dynamic import for client component
const CourseDetail = dynamic(() => import('@/components/Course/CourseDetail'), {
  ssr: true,
  loading: () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-pulse">
        <div className="h-8 bg-[color:var(--ai-card-border)]/50 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[color:var(--ai-card-border)]/50 rounded w-2/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-[color:var(--ai-card-border)]/50 rounded-lg"></div>
          <div className="h-80 bg-[color:var(--ai-card-border)]/50 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
});

// Generate metadata dynamically for each course
export async function generateMetadata({ params }: { params: { courseId: string } | Promise<{ courseId: string }> }): Promise<Metadata> {
  try {
    // Await params if they are a Promise
    const resolvedParams = 'then' in params ? await params : params;
    const courseId = String(resolvedParams.courseId);

    const course = await getCourseById(courseId);
    if (!course) {
      return {
        title: 'Course Not Found',
        description: 'The requested course could not be found.'
      };
    }

    return constructCourseMetadata({
      title: course.title || course.name || 'Course',
      description: course.description || 'No description available',
      instructorName: course.instructorName || (typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'Unknown Instructor'),
      updatedAt: course.updatedAt ? (typeof course.updatedAt === 'string' ? course.updatedAt : course.updatedAt.toString()) : undefined,
      createdAt: course.createdAt ? (typeof course.createdAt === 'string' ? course.createdAt : course.createdAt.toString()) : undefined,
      slug: courseId,
      coverImage: course.coverImage || course.imageUrl
    });
  } catch (error) {
    console.error('Error generating course metadata:', error);
    return {
      title: 'Course Details',
      description: 'View course details and curriculum'
    };
  }
}

export default async function Page({ params }: { params: { courseId: string } | Promise<{ courseId: string }> }) {
  // Await params if they are a Promise
  const resolvedParams = 'then' in params ? await params : params;
  const courseId = String(resolvedParams.courseId);

  // Fetch course data for structured data and SSR content
  let courseStructuredData: string | null = null;
  let breadcrumbStructuredData: string | null = null;
  let courseTitle = '';
  let courseDescription = '';
  let courseInstructor = '';
  try {
    const course = await getCourseById(courseId);
    if (course) {
      courseTitle = course.title || course.name || 'Course';
      courseDescription = course.description || 'No description available';
      courseInstructor = course.instructorName || (typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'StudiAI');
      
      courseStructuredData = generateCourseStructuredData({
        title: courseTitle,
        description: courseDescription,
        instructorName: courseInstructor,
        updatedAt: course.updatedAt ? (typeof course.updatedAt === 'string' ? course.updatedAt : course.updatedAt.toString()) : undefined,
        createdAt: course.createdAt ? (typeof course.createdAt === 'string' ? course.createdAt : course.createdAt.toString()) : undefined,
        slug: courseId,
        coverImage: course.coverImage || course.imageUrl,
        price: course.price,
        rating: course.rating,
        ratingCount: course.ratingCount,
        lessons: course.lessons,
      });
      breadcrumbStructuredData = generateBreadcrumbStructuredData([
        { name: 'Home', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro', position: 1 },
        { name: 'Courses', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro'}/courses`, position: 2 },
        { name: courseTitle, url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro'}/courses/${courseId}`, position: 3 },
      ]);
    }
  } catch {
    // Continue without structured data if fetch fails
  }

  return (
    <>
      {courseStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: courseStructuredData }}
        />
      )}
      {breadcrumbStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbStructuredData }}
        />
      )}
      {/* SSR content for AI crawlers — CourseDetail is client-side and invisible to AI bots */}
      {courseTitle && (
        <section aria-hidden="true" className="sr-only">
          <h1>{courseTitle}</h1>
          <p>{courseDescription}</p>
          <p>Instructor: {courseInstructor}</p>
          <p>Platform: StudiAI (studiai.ro) — Romanian AI development education</p>
          <a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro'}/courses/${courseId}`}>
            Enroll in {courseTitle}
          </a>
        </section>
      )}
      <CourseDetail courseId={courseId} />
    </>
  );
}