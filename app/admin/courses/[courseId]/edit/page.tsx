'use client';
import EditCourseForm from '@/components/Course/EditCourseForm';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const t = useTranslations('admin');

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('courses.editCourse')}</h1>
      <EditCourseForm courseId={courseId} />
    </div>
  );
}
