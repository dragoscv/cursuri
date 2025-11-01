'use client';
import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import LessonsTable from '@/components/Admin/LessonsTable';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { collection, getDocs, getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
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

        const db = getFirestore(firebaseApp);
        const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
        const querySnapshot = await getDocs(lessonsCollection);

        const lessonsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
        // Optimistically update UI
        setLessons(reorderedLessons);

        // Check authentication status
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth(firebaseApp);
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error('No authenticated user');
        }

        // Check user role from Firestore
        const db = getFirestore(firebaseApp);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();

        if (!userData?.role || !['admin', 'super_admin'].includes(userData.role)) {
          throw new Error(`Insufficient permissions. Current role: ${userData?.role || 'none'}`);
        }

        // Update order in Firestore using individual updates instead of batch
        const updatePromises = reorderedLessons.map(async (lesson, index) => {
          const lessonRef = doc(db, `courses/${courseId}/lessons`, lesson.id);
          return updateDoc(lessonRef, { order: index });
        });

        await Promise.all(updatePromises);

        showToast({
          type: 'success',
          title: 'Lessons Reordered',
          message: 'Lesson order has been updated successfully',
          duration: 3000,
        });
      } catch (error: any) {
        console.error('[AdminLessonsListPage] Error reordering lessons:', {
          error,
          message: error?.message,
          code: error?.code,
        });

        showToast({
          type: 'error',
          title: 'Permission Error',
          message:
            error?.message || 'Failed to update lesson order. Please check your admin permissions.',
          duration: 5000,
        });

        // Revert optimistic update on error
        const db = getFirestore(firebaseApp);
        const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
        const querySnapshot = await getDocs(lessonsCollection);
        const originalLessons = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessons(originalLessons);
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
          {t('lessons.addLesson')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[color:var(--ai-muted)]">{t('lessons.loadingLessons')}</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--ai-card-bg)]/60 rounded-xl border border-[color:var(--ai-card-border)]">
          <p className="text-[color:var(--ai-muted)] mb-4">{t('lessons.noLessonsFound')}</p>
          <Button
            color="primary"
            onPress={() => router.push(`/admin/courses/${courseId}/lessons/add`)}
          >
            {t('lessons.addFirstLesson')}
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
