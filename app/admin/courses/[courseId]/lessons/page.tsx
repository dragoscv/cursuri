'use client';
import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import LessonsTable from '@/components/Admin/LessonsTable';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/utils/firebase/firebase.config';

export default function AdminLessonsListPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const t = useTranslations('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);

  // Fetch lessons directly from Firestore
  useEffect(() => {
    if (!courseId) return;

    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        console.log(`[AdminLessonsListPage] Fetching lessons for course: ${courseId}`);

        const db = getFirestore(firebaseApp);
        const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
        const querySnapshot = await getDocs(lessonsCollection);

        const lessonsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(`[AdminLessonsListPage] Found ${lessonsData.length} lessons:`, lessonsData);
        setLessons(lessonsData);
      } catch (error) {
        console.error('[AdminLessonsListPage] Error fetching lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  const handleEdit = useCallback(
    (lessonId: string) => {
      router.push(`/admin/courses/${courseId}/lessons/${lessonId}/edit`);
    },
    [router, courseId]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
          {t('lessons.title')}
        </h1>
        <Button
          color="primary"
          onPress={() => router.push(`/admin/courses/${courseId}/lessons/add`)}
        >
          Add Lesson
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[color:var(--ai-muted)]">Loading lessons...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--ai-card-bg)]/60 rounded-xl border border-[color:var(--ai-card-border)]">
          <p className="text-[color:var(--ai-muted)] mb-4">No lessons found for this course</p>
          <Button
            color="primary"
            onPress={() => router.push(`/admin/courses/${courseId}/lessons/add`)}
          >
            Add First Lesson
          </Button>
        </div>
      ) : (
        <LessonsTable lessons={lessons} courseId={courseId} onEdit={handleEdit} />
      )}
    </div>
  );
}
