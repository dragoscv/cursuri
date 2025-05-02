'use client'

import AddCourseForm from '@/components/Course/AddCourseForm';
import { useRouter } from 'next/navigation';

export default function AddCoursePage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Add New Course</h1>
      <AddCourseForm onClose={() => router.back()} />
    </div>
  );
}
