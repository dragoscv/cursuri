import React from 'react';
import { motion } from 'framer-motion';
import CourseHeader from './CourseHeader';
import CourseDetails from './CourseDetails';
import CourseEnrollment from './CourseEnrollment';

interface CourseDetailProps {
    course: any;
    courseId: string;
    courseLessons: any[];
    hasAccess: boolean;
    isAdmin: boolean;
}

export default function CourseDetailView({
    course,
    courseId,
    courseLessons,
    hasAccess,
    isAdmin
}: CourseDetailProps) {
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
                    <CourseEnrollment
                        course={course}
                        isPurchased={hasAccess || isAdmin}
                    />
                </motion.div>
            </div>
        </div>
    );
}