'use client'

import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { Lesson } from '../../types';
import { useRouter } from 'next/navigation';

interface LessonNavigationProps {
    courseId: string;
    currentLessonId: string;
    previousLesson: Lesson | null;
    nextLesson: Lesson | null;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
    courseId,
    currentLessonId,
    previousLesson,
    nextLesson
}) => {
    const router = useRouter();

    return (
        <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden mt-8">
            <div className="p-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Lesson Navigation
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {previousLesson ? (
                        <Button
                            variant="flat"
                            className="bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors justify-start"
                            onClick={() => router.push(`/courses/${courseId}/lessons/${previousLesson.id}`)}
                            startContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            }
                        >
                            <div className="flex flex-col items-start text-left">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Previous Lesson</span>
                                <span className="truncate max-w-[150px]">{previousLesson.name}</span>
                            </div>
                        </Button>
                    ) : (
                        <Button
                            variant="flat"
                            className="bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => router.push(`/courses/${courseId}`)}
                            startContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            }
                        >
                            Back to Course
                        </Button>
                    )}

                    {nextLesson ? (
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white justify-end"
                            onClick={() => router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)}
                            endContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            }
                        >
                            <div className="flex flex-col items-end text-right">
                                <span className="text-xs text-indigo-100">Next Lesson</span>
                                <span className="truncate max-w-[150px]">{nextLesson.name}</span>
                            </div>
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            onClick={() => router.push(`/courses/${courseId}`)}
                            endContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                        >
                            Complete Course
                        </Button>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <Link href={`/courses/${courseId}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        Return to course overview
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default LessonNavigation;
