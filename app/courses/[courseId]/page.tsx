'use client'

import React, { useContext } from 'react';
import { AppContext } from '../../../components/AppContext';
import { Spinner } from '@heroui/react';
import CourseDetailView from '@/components/Course/CourseDetailView';

// Fix for Next.js 15 params Promise issue
export default function CourseDetailPage({
    params
}: {
    params: { courseId: string } | Promise<{ courseId: string }>
}) {
    // Unwrap the params using React.use() to handle both Promise and non-Promise cases
    const unwrappedParams = React.use(params instanceof Promise ? params : Promise.resolve(params));
    const { courseId } = unwrappedParams;

    const context = useContext(AppContext);

    if (!context) {
        throw new Error('CourseDetailPage must be used within an AppContextProvider');
    }

    const { courses, userPaidProducts, lessons, isAdmin } = context;

    const course = courses ? courses[courseId] : null;

    // Get lessons for this course from context
    const courseLessons = lessons && courseId && lessons[courseId]
        ? Object.values(lessons[courseId])
        : [];

    // Check if the course has been purchased
    const isPurchased = userPaidProducts?.some(
        (product) => product.metadata?.courseId === courseId
    );

    const hasAccess = isPurchased;

    if (!course) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <CourseDetailView
            course={course}
            courseId={courseId}
            courseLessons={courseLessons}
            hasAccess={hasAccess}
            isAdmin={isAdmin}
        />
    );
}