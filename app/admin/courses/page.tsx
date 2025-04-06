'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { useRouter } from 'next/navigation';
import AdminCoursesView from '@/components/Admin/Courses/AdminCoursesView';
import { CourseWithPriceProduct } from '@/types';

export default function AdminCoursesPage() {
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { courses, isAdmin, user } = context;

    // Redirect if not admin
    useEffect(() => {
        if (user && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, user, router]);

    const handleAddCourse = () => {
        router.push('/admin/courses/add');
    };

    const handleEditCourse = (course: CourseWithPriceProduct) => {
        router.push(`/admin/courses/${course.id}/edit`);
    };

    const handleViewCourse = (course: CourseWithPriceProduct) => {
        router.push(`/admin/courses/${course.id}`);
    };

    return (
        <AdminCoursesView
            courses={courses}
            onAddCourse={handleAddCourse}
            onViewCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
        />
    );
}