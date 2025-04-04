import React from 'react';
import { Button } from '@heroui/react';
import { FiArrowLeft } from '@/components/icons/FeatherIcons';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CourseProgressHeaderProps {
    courseId: string;
    courseName: string;
    difficulty: string;
    lessonCount: number;
    completedLessonsCount: number;
    isLoading: boolean;
}

export default function CourseProgressHeader({
    courseId,
    courseName,
    difficulty,
    lessonCount,
    completedLessonsCount,
    isLoading
}: CourseProgressHeaderProps) {
    const progressPercentage = (completedLessonsCount / (lessonCount || 1)) * 100;

    return (
        <div className="mb-8">
            <Link href={`/courses/${courseId}`}>
                <Button
                    variant="light"
                    startContent={<FiArrowLeft />}
                    className="mb-4"
                >
                    Back to Course
                </Button>
            </Link>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold">{courseName}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {lessonCount} lessons • {difficulty || 'All levels'}
                    </p>
                </div>

                {isLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="relative w-32 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-primary-500 transition-all duration-300 ease-in-out rounded-full"
                                    style={{ width: '0%' }}
                                />
                            </div>
                            <span className="text-sm font-medium">
                                Loading...
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="relative w-32 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-primary-500 transition-all duration-300 ease-in-out rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium">
                                {Math.round(progressPercentage)}% Complete
                            </span>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}