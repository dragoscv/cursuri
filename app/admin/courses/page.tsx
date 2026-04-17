'use client';

import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { useLocale, useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import AdminGuard from '@/components/Admin/AdminGuard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { ConfirmDialog, DataToolbar, EmptyState } from '@/components/Admin/shell';
import { IconPlus } from '@/components/Admin/shell/icons';
import { CourseWithPriceProduct } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';
import { getCoursePrice } from '@/utils/pricing';
import { Select, SelectItem } from '@heroui/react';
import { FiBookOpen, FiTrash2 } from '@/components/icons/FeatherIcons';
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
  };

  // Derive visible courses based on search + status filter
  const visibleCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orderedCourses.filter((course) => {
      if (statusFilter !== 'all' && course.status !== statusFilter) return false;
      if (!term) return true;
      const haystack = [course.name, course.description, ...(course.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [orderedCourses, search, statusFilter]);

  // Delete course function
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-sm"
            >
              <IconPlus className="w-4 h-4" />
              {t('addCourse')}
            </Link>
          }
        />

        <div className="mb-5">
          <DataToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search courses by name…"
            filters={
              <Select
                aria-label="Filter by status"
                size="sm"
                variant="flat"
                className="min-w-[140px]"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) =>
                  setStatusFilter(Array.from(keys)[0] as 'all' | 'active' | 'draft')
                }
              >
                <SelectItem key="all">All status</SelectItem>
                <SelectItem key="active">{t('active')}</SelectItem>
                <SelectItem key="draft">{t('draft')}</SelectItem>
              </Select>
            }
            actions={
              <div className="inline-flex items-center rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedView('grid')}
                  className={[
                    'px-3 h-8 text-xs font-medium rounded-md transition',
                    selectedView === 'grid'
                      ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/15 text-[color:var(--ai-primary)]'
                      : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]',
                  ].join(' ')}
                >
                  {t('grid')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('list')}
                  className={[
                    'px-3 h-8 text-xs font-medium rounded-md transition',
                    selectedView === 'list'
                      ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/15 text-[color:var(--ai-primary)]'
                      : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]',
                  ].join(' ')}
                >
                  {t('list')}
                </button>
              </div>
            }
          />
          {(search || statusFilter !== 'all') && (
            <div className="mt-2 text-xs text-[color:var(--ai-muted)]">
              Showing <span className="text-[color:var(--ai-foreground)] font-medium">{visibleCourses.length}</span> of{' '}
              <span className="text-[color:var(--ai-foreground)] font-medium">{orderedCourses.length}</span> courses
            </div>
          )}
        </div>

        {/* Course list */}
        {visibleCourses.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={visibleCourses.map(c => c.id)}
              strategy={selectedView === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {isSaving && (
                <div className="text-xs text-[color:var(--ai-primary)] animate-pulse mb-2 inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ai-primary)] animate-pulse" />
                  Saving order…
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
                {visibleCourses.map((course, index) => (
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
        ) : orderedCourses.length === 0 ? (
          <EmptyState
            icon={<FiBookOpen size={22} />}
            title={t('noCourses')}
            description={t('noCoursesDescription')}
            action={
              <Link
                href="/admin/courses/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-sm"
              >
                <IconPlus className="w-3.5 h-3.5" />
                {t('addCourse')}
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<FiBookOpen size={22} />}
            title="No matching courses"
            description="Try a different search term or change the status filter."
          />
        )}

        <ConfirmDialog
          isOpen={pendingDelete !== null}
          onClose={() => (deletingCourse ? null : setPendingDelete(null))}
          onConfirm={async () => {
            if (pendingDelete) {
              await handleDeleteCourse(pendingDelete.id!, pendingDelete.name);
            }
          }}
          loading={deletingCourse !== null}
          tone="danger"
          icon={<FiTrash2 size={18} />}
          title={t('confirmDelete')}
          description={
            pendingDelete
              ? `${t('confirmDeleteMessage', { courseName: pendingDelete.name })} ${t('confirmDeleteWarning')}`
              : ''
          }
          confirmLabel={deletingCourse ? t('deleting') : t('delete')}
          cancelLabel={t('cancel')}
        />
      </>
    </AdminGuard>
  );
}
