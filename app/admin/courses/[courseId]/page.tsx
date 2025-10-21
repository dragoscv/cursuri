'use client';
import React, { useContext } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import CourseDetailView from '@/components/Course/CourseDetailView';

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const context = useContext(AppContext);
  const course = context?.courses?.[courseId];
  const t = useTranslations('admin');
  // lessons may be an object, convert to array if needed
  const lessonsRaw = context?.lessons?.[courseId] || [];
  const lessons = Array.isArray(lessonsRaw) ? lessonsRaw : Object.values(lessonsRaw);
  // For admin, always hasAccess = true
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('courses.courseDetails')}</h1>
      {course ? (
        <CourseDetailView
          course={course}
          courseId={courseId}
          courseLessons={lessons}
          hasAccess={true}
          isAdmin={true}
        />
      ) : (
        <div>Course not found.</div>
      )}
    </div>
  );
}
