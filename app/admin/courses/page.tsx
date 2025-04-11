'use client'

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { CourseWithPriceProduct } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CoursesPage() {
    const [selectedView, setSelectedView] = useState<"grid" | "list">("grid");
    const [courseToDelete, setCourseToDelete] = useState<CourseWithPriceProduct | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { courses, openModal, closeModal } = context;
    const router = useRouter();

    // Helper function to safely format price
    const formatPrice = (course: CourseWithPriceProduct): string => {
        if (course.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
            const amount = course.priceProduct.prices[0].unit_amount / 100;
            const currency = course.priceProduct.prices[0].currency || 'RON';
            return amount.toLocaleString('ro-RO', {
                style: 'currency',
                currency: currency,
            });
        }
        return 'Price not available';
    };

    // Confirm delete modal
    const handleConfirmDelete = (course: CourseWithPriceProduct) => {
        setCourseToDelete(course);
        openModal({
            id: 'delete-course',
            isOpen: true,
            modalHeader: 'Confirm Delete',
            modalBody: (
                <div className="p-4">
                    <p className="mb-4">Are you sure you want to delete the course "{course.name}"?</p>
                    <div className="flex justify-end gap-2">
                        <Button
                            color="default"
                            variant="flat"
                            onClick={() => closeModal('delete-course')}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onClick={() => {
                                // Delete course logic would go here
                                console.log(`Deleting course: ${course.id}`);
                                closeModal('delete-course');
                            }}
                        >
                            Delete
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
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <>
            <AdminPageHeader
                title="Course Management"
                description="Create, edit, and manage your courses and their content."
                actions={
                    <Link href="/admin/courses/add">
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none shadow-sm hover:shadow-md transition-shadow px-4 py-2"
                            startContent={(
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        >
                            Add Course
                        </Button>
                    </Link>
                }
            />

            <div className="bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/20 rounded-xl p-4 mb-7 shadow-sm">
                <div className="flex items-center justify-end gap-2">
                    <Button
                        color={selectedView === "grid" ? "primary" : "default"}
                        variant={selectedView === "grid" ? "flat" : "light"}
                        onClick={() => setSelectedView("grid")}
                        size="sm"
                        className={selectedView === "grid" ? "bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm" : ""}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="ml-2">Grid</span>
                    </Button>
                    <Button
                        color={selectedView === "list" ? "primary" : "default"}
                        variant={selectedView === "list" ? "flat" : "light"}
                        onClick={() => setSelectedView("list")}
                        size="sm"
                        className={selectedView === "list" ? "bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm" : ""}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2">List</span>
                    </Button>
                </div>
            </div>

            {/* Course list */}
            {Object.keys(courses).length > 0 ? (
                <motion.div
                    className={selectedView === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
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
                                            <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)]">{course.name}</h3>
                                            <Chip
                                                color={course.status === "active" ? "success" : "warning"}
                                                size="sm"
                                                className={course.status === "active"
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"}
                                            >
                                                {course.status}
                                            </Chip>
                                        </div>
                                        <p className="text-[color:var(--ai-muted)] mb-4 line-clamp-2 min-h-[3rem]">
                                            {course.description || 'No description available'}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {course.tags && course.tags.length > 0 && course.tags.map((tag, index) => (
                                                <Chip key={index} size="sm" variant="flat" color="default" className="bg-[color:var(--ai-card-bg)]/80">
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleConfirmDelete(course);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                                <Link href={`/admin/courses/${course.id}/edit`}>
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="flat"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/courses/${course.id}`}>
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
                                                    >
                                                        View
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
                        <svg className="h-8 w-8 text-[color:var(--ai-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-[color:var(--ai-foreground)] font-medium mb-1">No courses available</p>
                    <p className="text-[color:var(--ai-muted)] text-sm mb-4">Start by creating your first course</p>
                    <Link href="/admin/courses/add">
                        <Button
                            size="md"
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-sm"
                        >
                            Add Course
                        </Button>
                    </Link>
                </div>
            )}
        </>
    );
}
