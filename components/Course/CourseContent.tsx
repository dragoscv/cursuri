import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Chip, Card } from '@heroui/react';
import { Course, Lesson } from "@/types";
import {
    FiPlay,
    FiLock,
    FiCheck,
    FiClock,
    FiBookOpen
} from '../icons/FeatherIcons';
import { AlertIcon } from '../icons/svg';

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
}) => {    // Debug lessons input with more detailed information
    console.log('CourseContent received lessons:', {
        count: lessons?.length || 0,
        isArray: Array.isArray(lessons),
        isEmpty: !lessons || lessons.length === 0,
        firstLesson: lessons && lessons.length > 0 ? lessons[0] : null,
        courseName: course?.name || 'Unknown Course'
    });

    // Safely handle potentially invalid lessons input
    const validLessons = Array.isArray(lessons) ?
        lessons.filter(lesson => lesson != null && lesson.id) :
        [];

    // Sort lessons by order
    const sortedLessons = [...validLessons].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });    // Group lessons by module/section if available
    const lessonsByModule = sortedLessons.reduce((groups, lesson) => {
        // Skip null/undefined lessons
        if (!lesson) return groups;

        const moduleId = lesson.moduleId || 'default';
        if (!groups[moduleId]) {
            groups[moduleId] = [];
        }
        groups[moduleId].push(lesson);
        return groups;
    }, {} as Record<string, Lesson[]>);

    // Debug the module grouping
    console.log('Lessons by module:', {
        moduleCount: Object.keys(lessonsByModule).length,
        moduleKeys: Object.keys(lessonsByModule),
        defaultModuleLessonCount: lessonsByModule['default']?.length || 0
    });

    const modules = course.modules || [];
    const defaultModule = { id: 'default', title: 'Course Content' };    // Animation variants
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
                damping: 15
            }
        }
    };

    // Log if we don't have any lessons to show
    if (sortedLessons.length === 0) {
        console.warn(`No lessons to display for course: ${course?.id || 'unknown'}`, {
            lessonsProvided: validLessons.length,
            course
        });
    }

    // Function to determine if a lesson is accessible
    const isLessonAccessible = (lesson: Lesson): boolean => {
        return Boolean(hasAccess || isAdmin || lesson.isFree === true);
    };

    // Function to check if lesson is completed
    const isLessonCompleted = (lessonId: string): boolean => {
        return completedLessons ? Boolean(completedLessons[lessonId]) : false;
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
                    className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 backdrop-blur-sm rounded-xl p-5 border border-[color:var(--ai-card-border)]/50 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Your Progress</h3>
                            <p className="text-sm text-[color:var(--ai-muted)]">
                                {Object.values(completedLessons).filter(Boolean).length} of {sortedLessons.length} {sortedLessons.length === 1 ? 'lesson' : 'lessons'} completed
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="relative h-6 w-40 bg-[color:var(--ai-card-border)]/30 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${calculateProgress()}%` }}
                                />
                            </div>
                            <span className="ml-3 font-medium text-[color:var(--ai-foreground)]">{calculateProgress()}%</span>
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
                    className="bg-[color:var(--ai-accent)]/10 rounded-xl p-5 border border-[color:var(--ai-accent)]/20 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-[color:var(--ai-accent)] p-2 bg-[color:var(--ai-accent)]/10 rounded-full">
                            <AlertIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Some Content is Locked</h3>
                            <p className="text-sm text-[color:var(--ai-muted)] mt-1">
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
                                className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
                            >
                                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                        <span>{module.title}</span>
                                        {module.lessonCount && (
                                            <span className="ml-2 text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                                {module.lessonCount} lessons
                                            </span>
                                        )}
                                    </h3>
                                    {module.description && (
                                        <p className="text-sm text-[color:var(--ai-muted)] mt-1">
                                            {module.description}
                                        </p>
                                    )}
                                </div>                                <div className="divide-y divide-[color:var(--ai-card-border)]/50">
                                    {(lessonsByModule[module.id] || [])
                                        .filter(lesson => lesson != null && lesson.id)
                                        .map((lesson, lessonIndex) => (
                                            <LessonItem
                                                key={lesson.id}
                                                lesson={lesson}
                                                index={lessonIndex}
                                                isCompleted={isLessonCompleted(lesson.id)}
                                                isAccessible={isLessonAccessible(lesson)}
                                                onClick={() => isLessonAccessible(lesson) && handleLessonClick(lesson)}
                                            />
                                        ))
                                    }
                                </div>
                            </motion.div>
                        ))}

                        {/* Show any lessons not assigned to a module */}
                        {lessonsByModule['default'] && lessonsByModule['default'].length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
                            >
                                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                                    <h3 className="font-medium text-[color:var(--ai-foreground)]">Additional Lessons</h3>
                                </div>                                <div className="divide-y divide-[color:var(--ai-card-border)]/50">
                                    {lessonsByModule['default']
                                        .filter(lesson => lesson != null && lesson.id)
                                        .map((lesson, lessonIndex) => (
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
                        className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
                    >
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <span>Course Content</span>
                                <span className="ml-2 text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                    {sortedLessons.length} lessons
                                </span>
                            </h3>
                        </div>                        {sortedLessons.length > 0 ? (
                            <div className="divide-y divide-[color:var(--ai-card-border)]/50">
                                {sortedLessons.map((lesson, index) => {
                                    if (!lesson || !lesson.id) {
                                        console.error('Invalid lesson data:', lesson);
                                        return null;
                                    }

                                    return (
                                        <LessonItem
                                            key={lesson.id}
                                            lesson={lesson}
                                            index={index}
                                            isCompleted={isLessonCompleted(lesson.id)}
                                            isAccessible={isLessonAccessible(lesson)}
                                            onClick={() => isLessonAccessible(lesson) && handleLessonClick(lesson)}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FiBookOpen className="w-12 h-12 text-[color:var(--ai-muted)]/40 mb-4" />
                                <h3 className="text-lg font-medium text-[color:var(--ai-foreground]">No lessons available</h3>                                <p className="mt-1 text-sm text-[color:var(--ai-muted)]">
                                    This course doesn&apos;t have any lessons yet.
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
    // Format duration in minutes to "HH:MM" format or "MM min" if less than an hour
    const formatDuration = (minutes?: number) => {
        if (!minutes) return "00:00";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0
            ? `${hrs}:${mins.toString().padStart(2, '0')}`
            : `${mins} min`;
    };

    const getIcon = () => {
        if (isCompleted) {
            return <FiCheck size={18} className="text-[color:var(--ai-success, #10b981)]" />;
        } else if (!isAccessible) {
            return <FiLock className="text-[color:var(--ai-muted)]" />;
        } else if (lesson.videoUrl) {
            return <FiPlay className="text-[color:var(--ai-primary)]" />;
        } else {
            return <FiBookOpen className="text-[color:var(--ai-primary)]" />;
        }
    }; return (<div
        className={`
                flex items-center p-4 hover:bg-[color:var(--ai-card-bg)]/80 transition-all duration-300 relative
                ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}
                ${isCompleted ? 'bg-gradient-to-r from-[color:var(--ai-success, #10b981)]/15 to-transparent border-l-4 border-[color:var(--ai-success, #10b981)]' : ''}
            `}
        onClick={onClick}
    >
        {/* Completion status indicator */}
        {isCompleted && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center">
                <div className="w-1 h-full bg-gradient-to-b from-[color:var(--ai-success, #10b981)] to-[color:var(--ai-success, #10b981)]/70"></div>
                <div className="absolute -left-2 bg-[color:var(--ai-success, #10b981)] rounded-full w-4 h-4 flex items-center justify-center border-2 border-[color:var(--ai-card-bg)] dark:border-[color:var(--ai-background)]">
                    <div className="w-1.5 h-1.5 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-background)] rounded-full"></div>
                </div>
            </div>
        )}            <div className={`
                flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-all duration-300 relative 
                ${isCompleted
                ? 'bg-[color:var(--ai-success, #10b981)] text-white border-4 border-[color:var(--ai-success, #10b981)]/60 ring-4 ring-[color:var(--ai-success, #10b981)]/20 shadow-lg'
                : !isAccessible
                    ? 'bg-[color:var(--ai-card-border)]/20 text-[color:var(--ai-muted)] border border-[color:var(--ai-card-border)]/30'
                    : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] border border-[color:var(--ai-primary)]/30'
            }
            `}>
            {isCompleted ? <FiCheck size={24} className="text-white" /> : getIcon()}
            {isCompleted && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[color:var(--ai-success, #10b981)] rounded-full flex items-center justify-center border-2 border-[color:var(--ai-card-bg)] dark:border-[color:var(--ai-background)] shadow-md">
                    <div className="w-2 h-2 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-background)] rounded-full"></div>
                </div>
            )}

        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center">
                <span className="text-sm font-medium text-[color:var(--ai-muted)] mr-2">
                    {(index + 1).toString().padStart(2, '0')}
                </span>                <div className="flex items-center">
                    <h4 className={`font-medium truncate
                        ${isCompleted ? 'text-[color:var(--ai-success, #10b981)]' :
                            !isAccessible ? 'text-[color:var(--ai-muted)]' :
                                'text-[color:var(--ai-foreground)]'}
                    `}>
                        {lesson.name}
                    </h4>
                    {isCompleted && (
                        <span className="ml-2 bg-[color:var(--ai-success, #10b981)] text-white px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1">
                            <FiCheck className="w-3 h-3" />
                            COMPLETED
                        </span>
                    )}
                </div>

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
                <p className="mt-1 text-sm text-[color:var(--ai-muted)] line-clamp-1">
                    {lesson.description}
                </p>
            )}
        </div>            <div className="ml-4 flex-shrink-0 flex items-center gap-3">
            {lesson.duration && (
                <span className="text-xs text-[color:var(--ai-muted)] flex items-center">
                    <FiClock className="mr-1 h-3.5 w-3.5" />
                    {lesson.duration}
                </span>)}{!isAccessible ? (
                    <span className="text-xs bg-[color:var(--ai-card-border)]/20 text-[color:var(--ai-muted)] px-2 py-1 rounded-full flex items-center">
                        <FiLock className="h-3 w-3 mr-1" />
                        Locked
                    </span>) : isCompleted ? (
                        <span className="text-xs bg-[color:var(--ai-success, #10b981)]/20 text-[color:var(--ai-success, #10b981)] px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold border border-[color:var(--ai-success, #10b981)]/30 shadow-sm">
                            <FiCheck className="h-3 w-3" />
                            Completed
                        </span>
                    ) : (
                    <span className="text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-1 rounded-full flex items-center">
                        <span className="w-2 h-2 bg-[color:var(--ai-primary)]/60 rounded-full mr-1.5"></span>
                        In Progress
                    </span>
                )}
        </div>
    </div>
    );
};

export default CourseContent;