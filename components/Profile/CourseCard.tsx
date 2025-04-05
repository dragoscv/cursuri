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
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border border-[color:var(--ai-card-border)] overflow-hidden h-full">
                <CardBody className="p-0">
                    {/* Course banner with progress overlay */}
                    <div className="relative">
                        <div className="h-32 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] relative">
                            {/* Pattern overlay */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* Course title */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <h3 className="text-white font-bold text-lg line-clamp-1">{course.name}</h3>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[color:var(--ai-card-border)]/20 dark:bg-[color:var(--ai-card-border)]/30">
                            <div
                                className="h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                style={{ width: `${course.progress}%` }}
                            ></div>
                        </div>

                        {/* Status badge */}
                        <div className="absolute top-4 right-4">
                            {course.status === 'completed' && (
                                <Chip color="success" variant="flat" size="sm">Completed</Chip>
                            )}
                            {course.status === 'in-progress' && (
                                <Chip color="primary" variant="flat" size="sm">In Progress</Chip>
                            )}
                            {course.status === 'not-started' && (
                                <Chip color="default" variant="flat" size="sm">Not Started</Chip>
                            )}
                        </div>
                    </div>

                    {/* Course details */}
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-muted)]">
                                <FiClock className="mr-1" /> {course.duration || '10 hours'}
                            </div>
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-muted)]">
                                <FiLayers className="mr-1" /> {course.totalLessons} lessons
                            </div>
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-muted)]">
                                <FiBarChart2 className="mr-1" /> {course.progress}% complete
                            </div>
                        </div>

                        <div className="text-sm text-[color:var(--ai-foreground)] line-clamp-2 mb-4 h-10">
                            {course.description || 'No description available.'}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <Link href={`/courses/${course.courseId}`}>
                                <Button color="primary" size="sm">
                                    View Course
                                </Button>
                            </Link>

                            {course.recentLessonId && (
                                <Link href={`/courses/${course.courseId}/lessons/${course.recentLessonId}`}>
                                    <Button color="default" variant="flat" size="sm">
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