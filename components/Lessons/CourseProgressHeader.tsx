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

            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 dark:border-gray-800/50 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {courseName}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {lessonCount} lessons • {difficulty || 'All levels'}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="relative w-32 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-gray-400 dark:bg-gray-600 animate-pulse rounded-full"
                                        style={{ width: '30%' }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Loading...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="relative w-32 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {Math.round(progressPercentage)}% Complete
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}