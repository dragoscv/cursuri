'use client'

import { Chip } from '@heroui/react'
import { Lesson } from '@/types'

interface LessonHeaderProps {
    lesson: Lesson;
    isCompleted: boolean;
    progressSaved: boolean;
    autoPlayNext: boolean;
    calculateProgress: () => number;
}

export default function LessonHeader({
    lesson,
    isCompleted,
    progressSaved,
    autoPlayNext,
    calculateProgress
}: LessonHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {lesson.name}
                    </h1>
                    {lesson.description && (
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                            {lesson.description}
                        </p>
                    )}
                </div>

                {/* Course Progress Indicator */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Course Progress</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{Math.round(calculateProgress())}%</span>
                    </div>
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            style={{ width: `${calculateProgress()}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Status indicators */}
            <div className="flex flex-wrap items-center gap-2">
                {isCompleted && (
                    <Chip
                        color="success"
                        variant="flat"
                        className="transition-all duration-300"
                        startContent={
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                        }
                    >
                        Completed
                    </Chip>
                )}

                {progressSaved && (
                    <Chip
                        color="primary"
                        variant="flat"
                        className="animate-pulse"
                        startContent={
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
                            </svg>
                        }
                    >
                        Progress Saved
                    </Chip>
                )}

                {autoPlayNext && (
                    <Chip
                        color="warning"
                        variant="flat"
                        startContent={
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
                            </svg>
                        }
                    >
                        Autoplay Next
                    </Chip>
                )}
            </div>
        </div>
    )
}