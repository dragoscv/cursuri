import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiBookOpen, FiLock, FiCheckCircle, FiPlay, FiClock } from '@/components/icons/FeatherIcons';
import { motion } from 'framer-motion';
import { Course, Lesson } from '@/types';

interface EnhancedLessonsListProps {
    lessons: Lesson[];
    course?: Course;
    courseId?: string;
    userHasAccess?: boolean;
    completedLessons?: Record<string, boolean>;
}

export default function EnhancedLessonsList({
    lessons,
    course,
    courseId: propsCourseId,
    userHasAccess = false,
    completedLessons = {}
}: EnhancedLessonsListProps) {
    const params = useParams();
    const courseId = propsCourseId || params.courseId;

    if (!lessons || lessons.length === 0) {
        return (
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-xl p-6 border border-[color:var(--ai-card-border)]/50 shadow-md">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center mb-4">
                        <FiBookOpen className="text-[color:var(--ai-primary)] text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">
                        No lessons available yet
                    </h3>
                    <p className="text-[color:var(--ai-muted)] max-w-md">
                        This course is still being developed. Check back soon for new content!
                    </p>
                </div>
            </div>
        );
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 15
            }
        }
    };

    // Sort lessons by their order property
    const sortedLessons = [...lessons].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });

    // Calculate total duration
    const totalDuration = sortedLessons.reduce((total, lesson) => total + (lesson.duration || 30), 0);
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    const durationText = hours > 0
        ? `${hours} ${hours === 1 ? 'hour' : 'hours'}${minutes > 0 ? ` ${minutes} min` : ''}`
        : `${minutes} minutes`;

    return (
        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 backdrop-blur-sm rounded-xl p-6 border border-[color:var(--ai-card-border)]/50 shadow-md">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-1">
                        Course Content
                    </h2>
                    <div className="flex items-center gap-3 text-[color:var(--ai-muted)] text-sm">
                        <div className="flex items-center gap-1">
                            <FiBookOpen className="w-3.5 h-3.5" />
                            <span>{sortedLessons.length} lessons</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5" />
                            <span>{durationText}</span>
                        </div>
                    </div>
                </div>

                {userHasAccess && Object.keys(completedLessons).length > 0 && (
                    <div className="bg-[color:var(--ai-primary)]/10 px-3 py-2 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                            <div className="text-[color:var(--ai-primary)] font-medium">
                                {Object.values(completedLessons).filter(v => v).length} / {sortedLessons.length}
                            </div>
                            <div className="w-24 h-2 bg-[color:var(--ai-card-border)]/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"
                                    style={{
                                        width: `${Math.round((Object.values(completedLessons).filter(v => v).length / sortedLessons.length) * 100)}%`
                                    }}
                                ></div>
                            </div>
                            <span className="text-[color:var(--ai-muted)]">completed</span>
                        </div>
                    </div>
                )}
            </div>

            <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {sortedLessons.map((lesson, index) => {
                    const isCompleted = completedLessons[lesson.id];

                    return (
                        <motion.div
                            key={lesson.id}
                            variants={itemVariants}
                            className={`relative rounded-xl transition-all duration-300 group 
                                ${userHasAccess || lesson.isFree
                                    ? 'bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-card-bg)] cursor-pointer shadow hover:shadow-md border border-[color:var(--ai-card-border)]'
                                    : 'bg-[color:var(--ai-card-bg)]/50 border-dashed cursor-not-allowed border border-[color:var(--ai-card-border)]/50'
                                }
                                ${isCompleted ? 'ring-1 ring-[color:var(--ai-primary)]/30' : ''}
                            `}
                        >
                            {/* Lesson Index Circle */}
                            <div className={`absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
                                ${isCompleted
                                    ? 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white'
                                    : userHasAccess || lesson.isFree
                                        ? 'bg-[color:var(--ai-primary)] text-white'
                                        : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-muted)]'
                                }
                            `}>
                                {isCompleted ? <FiCheckCircle className="w-3.5 h-3.5" /> : index + 1}
                            </div>

                            {userHasAccess || lesson.isFree ? (
                                <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="block p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-3">
                                            <div className={`rounded-md p-2 mt-1
                                                ${isCompleted
                                                    ? 'bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)]'
                                                    : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                                                }
                                            `}>
                                                {isCompleted ? <FiCheckCircle className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <h3 className={`font-medium transition-colors duration-300 
                                                    ${isCompleted ? 'text-[color:var(--ai-primary)]' : 'group-hover:text-[color:var(--ai-primary)]'}
                                                `}>
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-sm text-[color:var(--ai-muted)] line-clamp-2 mt-1">
                                                    {lesson.description || 'No description available'}
                                                </p>

                                                {lesson.isFree && !userHasAccess && (
                                                    <span className="inline-block mt-2 text-xs font-medium bg-[color:var(--ai-accent)]/10 text-[color:var(--ai-accent)] px-2 py-0.5 rounded-full">
                                                        Free Preview
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-sm text-[color:var(--ai-muted)]">{lesson.duration || 30} min</span>

                                            {isCompleted && (
                                                <span className="text-xs font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-md bg-[color:var(--ai-card-border)]/20 p-2 mt-1">
                                                <FiLock className="h-4 w-4 text-[color:var(--ai-muted)]" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-[color:var(--ai-muted)]">
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-sm text-[color:var(--ai-muted)]/70 line-clamp-2 mt-1">
                                                    {lesson.description || 'No description available'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm text-[color:var(--ai-muted)]/70">{lesson.duration || 30} min</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
