import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Chip, Card } from '@heroui/react';
import { Course, Lesson } from '@/types';
import {
    FiPlay,
    FiLock,
    FiCheck,
    FiClock,
    FiBookOpen
} from '../icons/FeatherIcons';

interface CourseContentProps {
    course: Course;
    lessons: Lesson[];
    hasAccess: boolean;
    isAdmin: boolean;
    completedLessons?: Record<string, boolean>;
    handleLessonClick: (lesson: Lesson) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({
    course,
    lessons,
    hasAccess,
    isAdmin,
    completedLessons = {},
    handleLessonClick
}) => {
    // Sort lessons by order
    const sortedLessons = [...lessons].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });

    // Group lessons by module/section if available
    const lessonsByModule = sortedLessons.reduce((groups, lesson) => {
        const moduleId = lesson.moduleId || 'default';
        if (!groups[moduleId]) {
            groups[moduleId] = [];
        }
        groups[moduleId].push(lesson);
        return groups;
    }, {} as Record<string, Lesson[]>);

    const modules = course.modules || [];
    const defaultModule = { id: 'default', title: 'Course Content' };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 12
            }
        }
    };

    // Function to determine if a lesson is accessible
    const isLessonAccessible = (lesson: Lesson) => {
        return hasAccess || isAdmin || lesson.isFree;
    };

    // Function to check if lesson is completed
    const isLessonCompleted = (lessonId: string) => {
        return completedLessons ? !!completedLessons[lessonId] : false;
    };

    // Calculate progress percentage
    const calculateProgress = () => {
        if (!completedLessons || sortedLessons.length === 0) return 0;
        const completedCount = Object.values(completedLessons).filter(Boolean).length;
        return Math.round((completedCount / sortedLessons.length) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Course Progress */}
            {hasAccess && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/40 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Progress</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {Object.values(completedLessons).filter(Boolean).length} of {sortedLessons.length} lessons completed
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="relative h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${calculateProgress()}%` }}
                                />
                            </div>
                            <span className="ml-3 font-medium text-gray-800 dark:text-white">{calculateProgress()}%</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Access Notification for Non-Enrolled Users */}
            {!hasAccess && !isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/40"
                >
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2 text-amber-600 dark:text-amber-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Some Content is Locked</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                Purchase this course to unlock all lessons. Free preview lessons are accessible to everyone.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Lesson List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {modules.length > 0 ? (
                    // Show lessons grouped by modules if they exist
                    <>
                        {modules.map((module, moduleIndex) => (
                            <motion.div
                                key={module.id || moduleIndex}
                                variants={itemVariants}
                                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                                        <span>{module.title}</span>
                                        {module.lessonCount && (
                                            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                {module.lessonCount} lessons
                                            </span>
                                        )}
                                    </h3>
                                    {module.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {module.description}
                                        </p>
                                    )}
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {(lessonsByModule[module.id] || []).map((lesson, lessonIndex) => (
                                        <LessonItem
                                            key={lesson.id}
                                            lesson={lesson}
                                            index={lessonIndex}
                                            isCompleted={isLessonCompleted(lesson.id)}
                                            isAccessible={isLessonAccessible(lesson)}
                                            onClick={() => isLessonAccessible(lesson) && handleLessonClick(lesson)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Show any lessons not assigned to a module */}
                        {lessonsByModule['default'] && lessonsByModule['default'].length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="font-medium text-gray-800 dark:text-white">Additional Lessons</h3>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {lessonsByModule['default'].map((lesson, lessonIndex) => (
                                        <LessonItem
                                            key={lesson.id}
                                            lesson={lesson}
                                            index={lessonIndex}
                                            isCompleted={isLessonCompleted(lesson.id)}
                                            isAccessible={isLessonAccessible(lesson)}
                                            onClick={() => isLessonAccessible(lesson) && handleLessonClick(lesson)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                ) : (
                    // Show flat list if no modules are defined
                    <motion.div
                        variants={itemVariants}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                    >
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                                <span>Course Content</span>
                                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                    {sortedLessons.length} lessons
                                </span>
                            </h3>
                        </div>

                        {sortedLessons.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {sortedLessons.map((lesson, index) => (
                                    <LessonItem
                                        key={lesson.id}
                                        lesson={lesson}
                                        index={index}
                                        isCompleted={isLessonCompleted(lesson.id)}
                                        isAccessible={isLessonAccessible(lesson)}
                                        onClick={() => isLessonAccessible(lesson) && handleLessonClick(lesson)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FiBookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No lessons available</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    This course doesn't have any lessons yet.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

interface LessonItemProps {
    lesson: Lesson;
    index: number;
    isCompleted: boolean;
    isAccessible: boolean;
    onClick: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, index, isCompleted, isAccessible, onClick }) => {
    const getIcon = () => {
        if (isCompleted) {
            return <FiCheck className="text-green-500" />;
        } else if (!isAccessible) {
            return <FiLock className="text-gray-400 dark:text-gray-500" />;
        } else if (lesson.videoUrl) {
            return <FiPlay className="text-indigo-500 dark:text-indigo-400" />;
        } else {
            return <FiBookOpen className="text-indigo-500 dark:text-indigo-400" />;
        }
    };

    return (
        <div
            className={`
                flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-750
                ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}
                ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/10' : ''}
            `}
            onClick={onClick}
        >
            <div className={`
                flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full mr-4
                ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    !isAccessible ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' :
                        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}
            `}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h4 className={`font-medium truncate
                        ${isCompleted ? 'text-green-700 dark:text-green-400' :
                            !isAccessible ? 'text-gray-500 dark:text-gray-400' :
                                'text-gray-900 dark:text-white'}
                    `}>
                        {lesson.name}
                    </h4>

                    {lesson.isFree && (
                        <Chip
                            size="sm"
                            variant="flat"
                            color="success"
                            className="ml-2 text-xs"
                        >
                            Free
                        </Chip>
                    )}
                </div>

                {lesson.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {lesson.description}
                    </p>
                )}
            </div>

            <div className="ml-4 flex-shrink-0 flex items-center gap-3">
                {lesson.duration && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <FiClock className="mr-1 h-3.5 w-3.5" />
                        {lesson.duration}
                    </span>
                )}

                {!isAccessible ? (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                        Locked
                    </span>
                ) : isCompleted ? (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                        <FiCheck className="h-3 w-3" />
                        Completed
                    </span>
                ) : null}
            </div>
        </div>
    );
};

export default CourseContent;