import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lesson, Course } from '../../types';
import { motion } from 'framer-motion';
import { FiPlay, FiCheck, FiLock, FiClock, FiBookOpen } from '../icons/FeatherIcons';

interface EnhancedLessonsListProps {
    lessons: Lesson[];
    course: Course;
    courseId: string;
    completedLessons?: string[]; // Array of completed lesson IDs
}

export const EnhancedLessonsList: React.FC<EnhancedLessonsListProps> = ({
    lessons,
    course,
    courseId,
    completedLessons = []
}) => {
    if (!lessons || lessons.length === 0) {
        return (
            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 dark:border-gray-800/50 shadow-xl text-center py-12">
                <FiBookOpen className="mx-auto text-4xl text-indigo-500 dark:text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">No lessons available yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Check back soon for updates to this course.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 dark:border-gray-800/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Course Content</h2>
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {completedLessons.length} / {lessons.length} completed
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-in-out rounded-full"
                        style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
                    />
                </div>

                <ul className="space-y-3">
                    {lessons.map((lesson, index) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isLocked = lesson.isLocked && !isCompleted;

                        return (
                            <motion.li
                                key={lesson.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="relative group"
                            >
                                <Link href={isLocked ? '#' : `/courses/${courseId}/lessons/${lesson.id}`}>
                                    <motion.div
                                        whileHover={!isLocked ? {
                                            scale: 1.01,
                                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                                        } : {}}
                                        className={`p-4 flex items-start gap-4 transition-all duration-200 rounded-xl 
                                          border border-gray-100 dark:border-gray-700
                                          ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                                          ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-white/80 dark:bg-gray-800/50'}`}
                                    >
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                                          ${isCompleted
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : isLocked
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <FiCheck className="text-xl" />
                                            ) : isLocked ? (
                                                <FiLock className="text-xl" />
                                            ) : lesson.videoUrl ? (
                                                <FiPlay className="text-xl" />
                                            ) : (
                                                <FiBookOpen className="text-xl" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-lg font-medium truncate 
                                              ${isCompleted ? 'text-green-600 dark:text-green-400' : isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                                {index + 1}. {lesson.title || lesson.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {lesson.description || 'No description available'}
                                            </p>

                                            <div className="flex items-center gap-4 mt-2">
                                                {lesson.videoUrl && (
                                                    <span className="inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                                                        <FiPlay className="mr-1 text-xs" />
                                                        Video lesson
                                                    </span>
                                                )}

                                                {lesson.estimatedTime && (
                                                    <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-300">
                                                        <FiClock className="mr-1 text-xs" />
                                                        {lesson.estimatedTime}
                                                    </span>
                                                )}

                                                {isCompleted && (
                                                    <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                                                        <FiCheck className="mr-1 text-xs" />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default EnhancedLessonsList;
