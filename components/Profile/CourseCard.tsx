import React from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiClock, FiLayers, FiBarChart2 } from '@/components/icons/FeatherIcons';
import Link from 'next/link';

interface CourseCardProps {
    course: {
        courseId: string;
        name: string;
        description?: string;
        progress: number;
        status: 'completed' | 'in-progress' | 'not-started';
        totalLessons: number;
        duration?: string;
        recentLessonId?: string;
    };
}

export default function CourseCard({ course }: CourseCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card className="border border-[color:var(--ai-card-border)] overflow-hidden h-full rounded-xl shadow-sm">
                <CardBody className="p-0">
                    {/* Course banner with progress overlay */}
                    <div className="relative">
                        <div className="h-36 bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] relative">
                            {/* Pattern overlay */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-30 mix-blend-overlay">
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                            <div className="absolute right-10 top-8 w-4 h-4 rounded-full bg-white/20" style={{ animationDelay: "0.5s" }}></div>

                            {/* Course title */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                                <h3 className="text-white font-bold text-xl line-clamp-1 drop-shadow-md">{course.name}</h3>
                            </div>
                        </div>                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                            <div
                                className="h-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]"
                                style={{ width: `${course.progress}%` }}
                            >
                                {/* Animated glowing effect */}
                                <div className="absolute top-0 h-full w-5 bg-white/30 animate-shimmer"></div>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="absolute top-4 left-4">
                            {course.status === 'completed' && (
                                <Chip color="success" variant="flat" size="sm" className="backdrop-blur-sm bg-black/20 border border-green-500/30 text-white shadow-sm">
                                    Completed
                                </Chip>
                            )}
                            {course.status === 'in-progress' && (
                                <Chip color="primary" variant="flat" size="sm" className="backdrop-blur-sm bg-black/20 border border-blue-500/30 text-white shadow-sm">
                                    In Progress
                                </Chip>
                            )}
                            {course.status === 'not-started' && (
                                <Chip color="default" variant="flat" size="sm" className="backdrop-blur-sm bg-black/20 border border-white/20 text-white shadow-sm">
                                    Not Started
                                </Chip>
                            )}
                        </div>
                    </div>

                    {/* Course details */}
                    <div className="p-5">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-foreground)]/70 bg-[color:var(--ai-card-bg)]/80 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20">
                                <FiClock className="mr-1.5 text-[color:var(--ai-primary)]" /> {course.duration || '10 hours'}
                            </div>
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-foreground)]/70 bg-[color:var(--ai-card-bg)]/80 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20">
                                <FiLayers className="mr-1.5 text-[color:var(--ai-secondary)]" /> {course.totalLessons} lessons
                            </div>
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-foreground)]/70 bg-[color:var(--ai-card-bg)]/80 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20">
                                <FiBarChart2 className="mr-1.5 text-[color:var(--ai-accent)]" /> {course.progress}% complete
                            </div>
                        </div>

                        <div className="text-sm text-[color:var(--ai-foreground)] line-clamp-2 mb-5 h-10 leading-tight">
                            {course.description || 'No description available.'}
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link href={`/courses/${course.courseId}`}>
                                <Button
                                    color="primary"
                                    size="sm"
                                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none shadow-sm hover:shadow-md transition-shadow"
                                >
                                    View Course
                                </Button>
                            </Link>

                            {course.recentLessonId && (
                                <Link href={`/courses/${course.courseId}/lessons/${course.recentLessonId}`}>
                                    <Button
                                        color="default"
                                        variant="flat"
                                        size="sm"
                                        className="border border-[color:var(--ai-card-border)] hover:bg-[color:var(--ai-primary)]/5 transition-colors"
                                    >
                                        Continue Learning
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}