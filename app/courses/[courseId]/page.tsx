'use client'

import React, { useEffect, useContext } from 'react';
import { AppContext } from '../../../components/AppContext';
import CourseHeader from '../../../components/Course/CourseHeader';
import CourseDetails from '../../../components/Course/CourseDetails';
import CourseEnrollment from '../../../components/Course/CourseEnrollment';
import { motion } from 'framer-motion';
import { Spinner } from '@heroui/react';
import { useCourseParams } from '@/utils/hooks/useParams';

// Define the props interface for your page component
interface CourseDetailPageProps {
    params: {
        courseId: string;
    }
}

export default function CourseDetailPage(props: CourseDetailPageProps) {
    // Use the custom hook to safely access params
    const { courseId } = useCourseParams(props.params);
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('CourseDetailPage must be used within an AppContextProvider');
    }

    const { courses, userPaidProducts, getCourseLessons, lessons } = context;

    // Fetch course lessons when component mounts
    useEffect(() => {
        if (courseId) {
            getCourseLessons(courseId);
        }
    }, [courseId, getCourseLessons]);

    const course = courses ? courses[courseId] : null;

    // Get lessons for this course from context
    const courseLessons = lessons && courseId && lessons[courseId]
        ? Object.values(lessons[courseId])
        : [];

    // Check if the course has been purchased
    const isPurchased = userPaidProducts?.some(
        (product) => product.productId === courseId
    );

    if (!course) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <CourseHeader course={course} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <CourseDetails
                        course={course}
                        courseId={courseId}
                        lessons={courseLessons}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <CourseEnrollment course={course} isPurchased={isPurchased} />
                </motion.div>
            </div>
        </div>
    );
}