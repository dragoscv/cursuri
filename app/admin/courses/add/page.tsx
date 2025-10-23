'use client';

import AddCourseForm from '@/components/Course/AddCourseForm';
import AdminGuard from '@/components/Admin/AdminGuard';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AddCoursePage() {
  const router = useRouter();
  const t = useTranslations('admin.courses');

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">{t('addNew')}</h1>
        <AddCourseForm onClose={() => router.back()} />
      </div>
    </AdminGuard>
  );
}
