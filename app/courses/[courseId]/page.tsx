import React from 'react';
import { Metadata } from 'next';
import { getCourseById } from '@/utils/firebase/server';
import { constructCourseMetadata } from '@/utils/metadata';
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

  return (
    <>
      <CourseDetail courseId={courseId} />
    </>
  );
}