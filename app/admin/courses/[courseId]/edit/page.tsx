'use client';
import AddCourseForm from '@/components/Course/AddCourseForm';
import AdminGuard from '@/components/Admin/AdminGuard';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const t = useTranslations('admin');

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">{t('courses.editCourse')}</h1>
        <AddCourseForm courseId={courseId} onClose={() => router.back()} />
      </div>
    </AdminGuard>
  );
}
