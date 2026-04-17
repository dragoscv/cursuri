'use client';

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { useLocale, useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import AdminGuard from '@/components/Admin/AdminGuard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { ConfirmDialog, DataToolbar, EmptyState } from '@/components/Admin/shell';
import { CourseWithPriceProduct } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';
import { getCoursePrice } from '@/utils/pricing';
import { Select, SelectItem } from '@heroui/react';
import { FiBookOpen, FiTrash2, FiPlus } from '@/components/icons/FeatherIcons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const badgeConfig: Record<string, { color: 'warning' | 'success' | 'primary' | 'secondary' | 'default' | 'danger'; icon: string }> = {
  'Cel Mai Popular': { color: 'warning', icon: '⭐' },
  'Cel Mai Recomandat': { color: 'success', icon: '✅' },
  'Nou': { color: 'primary', icon: '🆕' },
  'Best Seller': { color: 'secondary', icon: '🔥' },
  'Gratuit': { color: 'default', icon: '🎁' },
  'Ofertă Limitată': { color: 'danger', icon: '⏰' },
};

function SortableCourseCard({
  course,
  index,
  formatPrice,
  selectedView,
  onDelete,
  t,
}: {
  course: CourseWithPriceProduct;
  index: number;
  formatPrice: (course: CourseWithPriceProduct) => string;
  selectedView: 'grid' | 'list';
  onDelete: (course: CourseWithPriceProduct) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const badges: string[] = (course as any).badges || [];

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border border-[color:var(--ai-card-border)] overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardBody>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] p-1 shrink-0 touch-none"
                aria-label="Drag to reorder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
              <span className="text-xs font-mono text-[color:var(--ai-muted)] shrink-0">#{index + 1}</span>
              <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] line-clamp-1">
                {course.name}
              </h3>
            </div>
            <Chip
              className={
                course.status === 'active'
                  ? 'bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] text-xs px-2 py-0.5'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs px-2 py-0.5'
              }
            >
              {course.status}
            </Chip>
          </div>
          <p className="text-[color:var(--ai-muted)] mb-4 line-clamp-2 min-h-[3rem]">
            {course.description || t('noDescription')}
          </p>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {badges.map((badge) => {
                const config = badgeConfig[badge];
                return (
                  <Chip
                    key={badge}
                    size="sm"
                    color={config?.color || 'default'}
                    variant="flat"
                    className="text-xs"
                  >
                    {config?.icon} {badge}
                  </Chip>
                );
              })}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {course.tags &&
              course.tags.length > 0 &&
              course.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  className="bg-[color:var(--ai-card-bg)]/80 text-xs px-2 py-0.5"
                >
                  {tag}
                </Chip>
              ))}
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="text-sm font-medium text-[color:var(--ai-primary)]">
              {formatPrice(course)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onClick={() => onDelete(course)}
              >
                {t('delete')}
              </Button>
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20 rounded-lg transition-colors"
              >
                {t('edit')}
              </Link>
              <Link
                href={`/admin/courses/${course.id}/lessons`}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                {t('manageLessons')}
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function CoursesPage() {
  const locale = useLocale();
  const t = useTranslations('admin.courses');
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('list');
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext not found');
  }

  const { courses, products, refreshCourses } = context;
  const { showToast } = useToast();

  // Ordered courses array for DnD
  const [orderedCourses, setOrderedCourses] = useState<CourseWithPriceProduct[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  // Confirm dialog
  const [pendingDelete, setPendingDelete] = useState<CourseWithPriceProduct | null>(null);

  useEffect(() => {
    const sorted = Object.values(courses).sort((a, b) => {
      const orderA = (a as any).displayOrder ?? 999;
      const orderB = (b as any).displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });
    setOrderedCourses(sorted as CourseWithPriceProduct[]);
  }, [courses]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCourses.findIndex(c => c.id === active.id);
    const newIndex = orderedCourses.findIndex(c => c.id === over.id);
    const reordered = arrayMove(orderedCourses, oldIndex, newIndex);
    setOrderedCourses(reordered);

    setIsSaving(true);
    try {
      const batch = writeBatch(firestoreDB);
      reordered.forEach((course, index) => {
        const ref = doc(firestoreDB, 'courses', course.id);
        batch.update(ref, { displayOrder: index });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error saving course order:', error);
    } finally {
      setIsSaving(false);
    }
  }, [orderedCourses]);

  // Helper function to safely format price
  const formatPrice = (course: CourseWithPriceProduct): string => {
    const priceInfo = getCoursePrice(course, products);
    if (priceInfo.amount > 0) {
      return priceInfo.amount.toLocaleString(locale, {
        style: 'currency',
        currency: priceInfo.currency,
      });
    }
    return 'Price not available';
  }; // Delete course function
  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    setDeletingCourse(courseId);
    try {
      await deleteDoc(doc(firestoreDB, 'courses', courseId));
      await refreshCourses();
      showToast({
        type: 'success',
        title: t('courseDeleted'),
        message: t('courseDeletedMessage', { courseName }),
        duration: 5000,
      });
      setPendingDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast({
        type: 'error',
        title: t('failedToDeleteCourse'),
        message: error instanceof Error ? error.message : t('failedToDeleteMessage'),
        duration: 6000,
      });
    } finally {
      setDeletingCourse(null);
    }
  };

  const handleConfirmDelete = (course: CourseWithPriceProduct) => {
    setPendingDelete(course);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100 },
    },
  };

  return (
    <AdminGuard>
      <>
        <AdminPageHeader
          title={t('title')}
          description={t('pageDescription')}
          actions={
            <Link
              href="/admin/courses/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V20M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t('addCourse')}
            </Link>
          }
        />

        <div className="bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/20 rounded-xl p-4 mb-7 shadow-sm">
          <div className="flex items-center justify-end gap-2">
            {' '}
            <Button
              variant={selectedView === 'grid' ? 'primary' : 'bordered'}
              onClick={() => setSelectedView('grid')}
              size="sm"
              className={
                selectedView === 'grid'
                  ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 text-[color:var(--ai-foreground)] shadow-sm rounded-full'
                  : 'text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-card-border)]/20 rounded-full'
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="ml-2">{t('grid')}</span>
            </Button>
            <Button
              variant={selectedView === 'list' ? 'primary' : 'bordered'}
              onClick={() => setSelectedView('list')}
              size="sm"
              className={
                selectedView === 'list'
                  ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 text-[color:var(--ai-foreground)] shadow-sm rounded-full'
                  : 'text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-card-border)]/20 rounded-full'
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2">{t('list')}</span>
            </Button>
          </div>
        </div>

        {/* Course list */}
        {orderedCourses.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={orderedCourses.map(c => c.id)}
              strategy={selectedView === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {isSaving && (
                <div className="text-xs text-[color:var(--ai-muted)] animate-pulse mb-2">
                  Saving order...
                </div>
              )}
              <motion.div
                className={
                  selectedView === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {orderedCourses.map((course, index) => (
                  <motion.div key={course.id} variants={itemVariants}>
                    <SortableCourseCard
                      course={course}
                      index={index}
                      formatPrice={formatPrice}
                      selectedView={selectedView}
                      onDelete={handleConfirmDelete}
                      t={t}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16 px-4 border border-dashed border-[color:var(--ai-card-border)] rounded-xl bg-[color:var(--ai-card-bg)]/30">
            <div className="inline-flex items-center justify-center mb-3 p-3 rounded-full bg-[color:var(--ai-primary)]/10">
              <svg
                className="h-8 w-8 text-[color:var(--ai-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-[color:var(--ai-foreground)] font-medium mb-1">{t('noCourses')}</p>
            <p className="text-[color:var(--ai-muted)] text-sm mb-4">{t('noCoursesDescription')}</p>
            <Link
              href="/admin/courses/add"
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
            >
              {t('addCourse')}
            </Link>
          </div>
        )}
      </>
    </AdminGuard>
  );
}
