import React, { useState } from 'react';
import { CourseWithPriceProduct } from '@/types';
import AdminCoursesHeader from './AdminCoursesHeader';
import ViewToggle from './ViewToggle';
import CoursesGridView from './CoursesGridView';
import CoursesListView from './CoursesListView';
import { formatCoursePrice } from './utils';

interface AdminCoursesViewProps {
    courses: Record<string, CourseWithPriceProduct>;
    onAddCourse: () => void;
    onViewCourse: (course: CourseWithPriceProduct) => void;
    onEditCourse: (course: CourseWithPriceProduct) => void;
}

export default function AdminCoursesView({
    courses,
    onAddCourse,
    onViewCourse,
    onEditCourse
}: AdminCoursesViewProps) {
    const [view, setView] = useState<"grid" | "list">("grid");

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
                />
            ) : (
                <CoursesListView
                    courses={courses}
                    formatPrice={formatCoursePrice}
                    onViewCourse={onViewCourse}
                    onEditCourse={onEditCourse}
                />
            )}
        </div>
    );
}