'use client';

import React, { useContext, useState } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { useLocale, useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import AdminGuard from '@/components/Admin/AdminGuard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { CourseWithPriceProduct } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doc, deleteDoc } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';

export default function CoursesPage() {
  const locale = useLocale();
  const t = useTranslations('admin.courses');
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext not found');
  }

  const { courses, openModal, closeModal } = context;
  const { showToast } = useToast();

  // Helper function to safely format price
  const formatPrice = (course: CourseWithPriceProduct): string => {
    if (course.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
      const amount = course.priceProduct.prices[0].unit_amount / 100;
      const currency = course.priceProduct.prices[0].currency || 'RON';
      return amount.toLocaleString(locale, {
        style: 'currency',
        currency: currency,
      });
    }
    return 'Price not available';
  }; // Delete course function
  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    setDeletingCourse(courseId);
    try {
      // Delete course from Firestore
      await deleteDoc(doc(firestoreDB, 'courses', courseId));

      showToast({
        type: 'success',
        title: t('courseDeleted'),
        message: t('courseDeletedMessage', { courseName }),
        duration: 5000,
      });

      closeModal('delete-course');
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

  // Confirm delete modal
  const handleConfirmDelete = (course: CourseWithPriceProduct) => {
    openModal({
      id: 'delete-course',
      isOpen: true,
      modalHeader: t('confirmDelete'),
      modalBody: (
        <div className="p-4">
          <p className="mb-4">{t('confirmDeleteMessage', { courseName: course.name })}</p>
          <p className="text-sm text-[color:var(--ai-muted)] mb-4">{t('confirmDeleteWarning')}</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="bordered"
              onClick={() => closeModal('delete-course')}
              isDisabled={deletingCourse === course.id}
              className="bg-[color:var(--ai-card-bg)]/80 border border-[color:var(--ai-card-border)]/50 text-[color:var(--ai-foreground)] rounded-full hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDeleteCourse(course.id!, course.name)}
              isDisabled={deletingCourse === course.id}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full shadow-sm hover:shadow-md hover:shadow-red-500/20 transition-all"
            >
              {deletingCourse === course.id ? t('deleting') : t('delete')}
            </Button>
          </div>
        </div>
      ),
      headerDisabled: false,
      footerDisabled: true,
      onClose: () => closeModal('delete-course'),
    });
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
            <Link href="/admin/courses/add">
              <Button
                color="primary"
                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none shadow-sm hover:shadow-md transition-shadow px-4 py-2"
                startContent={
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
                }
              >
                {t('addCourse')}
              </Button>
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
        {Object.keys(courses).length > 0 ? (
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
            {Object.keys(courses).map((key) => {
              const course = courses[key] as CourseWithPriceProduct;
              return (
                <motion.div key={course.id} variants={itemVariants}>
                  <Card className="border border-[color:var(--ai-card-border)] overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardBody>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)]">
                          {course.name}
                        </h3>
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

                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags &&
                          course.tags.length > 0 &&
                          course.tags.map((tag, index) => (
                            <Chip
                              key={index}
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
                            onClick={() => handleConfirmDelete(course)}
                          >
                            {t('delete')}
                          </Button>
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            <Button size="sm" color="primary" variant="flat">
                              {t('edit')}
                            </Button>
                          </Link>
                          <Link href={`/admin/courses/${course.id}/lessons`}>
                            <Button
                              size="sm"
                              color="primary"
                              className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
                            >
                              {t('manageLessons')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
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
            <Link href="/admin/courses/add">
              <Button
                size="md"
                color="primary"
                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-sm"
              >
                {t('addCourse')}
              </Button>
            </Link>
          </div>
        )}
      </>
    </AdminGuard>
  );
}
