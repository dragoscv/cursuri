'use client';
import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import LessonsTable from '@/components/Admin/LessonsTable';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { collection, getDocs, getFirestore, doc, writeBatch } from 'firebase/firestore';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';

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

  const { showToast } = useToast();

  const handleReorder = useCallback(
    async (reorderedLessons: any[]) => {
      try {
        setLessons(reorderedLessons);

        // Update order in Firestore
        const db = getFirestore(firebaseApp);
        const batch = writeBatch(db);

        reorderedLessons.forEach((lesson, index) => {
          const lessonRef = doc(db, `courses/${courseId}/lessons`, lesson.id);
          batch.update(lessonRef, { order: index });
        });

        await batch.commit();

        showToast({
          type: 'success',
          title: 'Lessons Reordered',
          message: 'Lesson order has been updated successfully',
          duration: 3000,
        });
      } catch (error) {
        console.error('[AdminLessonsListPage] Error reordering lessons:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update lesson order. Please try again.',
          duration: 5000,
        });
      }
    },
    [courseId, showToast]
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
        <LessonsTable
          lessons={lessons}
          courseId={courseId}
          onEdit={handleEdit}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
}
