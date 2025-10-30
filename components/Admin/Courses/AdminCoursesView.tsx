'use client'

import React, { useState, useEffect } from 'react';
import { CourseWithPriceProduct } from '@/types';
import AdminCoursesHeader from './AdminCoursesHeader';
import ViewToggle from './ViewToggle';
import CoursesGridView from './CoursesGridView';
import CoursesListView from './CoursesListView';
import { formatCoursePrice } from './utils';
import { useRouter } from 'next/navigation';

interface AdminCoursesViewProps {
    courses: Record<string, CourseWithPriceProduct>;
    onAddCourse: (e?: React.MouseEvent) => void;
    onViewCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
    onEditCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
    onManageLessons?: (courseId: string, e?: React.MouseEvent) => void;
}

export default function AdminCoursesView({
    courses,
    onAddCourse,
    onViewCourse,
    onEditCourse,
    onManageLessons
}: AdminCoursesViewProps) {
    const [view, setView] = useState<"grid" | "list">("grid");
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleManageLessons = (courseId: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (onManageLessons) {
            onManageLessons(courseId, e);
        } else if (isMounted) {
            router.push(`/admin/courses/${courseId}/lessons`);
        }
    };

    // Only render the full component when mounted on the client
    if (!isMounted) {
        return <div className="max-w-7xl mx-auto px-4 py-8">Loading courses...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <AdminCoursesHeader onAddCourse={onAddCourse} />

            <ViewToggle view={view} onViewChange={setView} />

            {view === "grid" ? (
                <CoursesGridView
                    courses={courses}
                    formatPrice={formatCoursePrice}
                    onViewCourse={onViewCourse}
                    onEditCourse={onEditCourse}
                    onManageLessons={handleManageLessons}
                />
            ) : (
                <CoursesListView
                    courses={courses}
                    formatPrice={formatCoursePrice}
                    onViewCourse={onViewCourse}
                    onEditCourse={onEditCourse}
                    onManageLessons={handleManageLessons}
                />
            )}
        </div>
    );
}