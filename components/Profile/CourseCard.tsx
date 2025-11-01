import React from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiClock, FiLayers, FiBarChart2 } from '@/components/icons/FeatherIcons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Image from 'next/image';

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
        imageUrl?: string;
        coverImage?: string;
        accessType?: 'purchased' | 'subscription';
    };
}

export default function CourseCard({ course }: CourseCardProps) {
    const t = useTranslations('profile.courses');
    const courseImage = course.imageUrl || course.coverImage;

    return (
        <motion.article
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.3 }}
            className="h-full"
            aria-label={`Course: ${course.name}`}
        >
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm overflow-hidden h-full rounded-xl shadow-md"
                role="region"
                aria-labelledby={`course-title-${course.courseId}`}>
                <CardBody className="p-0">
                    {/* Course banner with progress overlay */}
                    <div className="relative">
                        {courseImage ? (
                            <div className="h-36 relative overflow-hidden">
                                <Image
                                    src={courseImage}
                                    alt={course.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                {/* Dark overlay for better text contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

                                {/* Course title */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                                    <h3 id={`course-title-${course.courseId}`} className="text-white font-bold text-xl line-clamp-1 drop-shadow-md">{course.name}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="h-36 bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] relative">
                                {/* Pattern overlay */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-30 mix-blend-overlay">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                                        <defs>
                                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                    </svg>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 animate-pulse" aria-hidden="true"></div>
                                <div className="absolute right-10 top-8 w-4 h-4 rounded-full bg-white/20" style={{ animationDelay: "0.5s" }} aria-hidden="true"></div>

                                {/* Course title */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                                    <h3 id={`course-title-${course.courseId}`} className="text-white font-bold text-xl line-clamp-1 drop-shadow-md">{course.name}</h3>
                                </div>
                            </div>
                        )}
                        {/* Progress bar */}
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
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {course.status === 'completed' && (
                                <Chip color="success" variant="flat" size="sm" radius="lg" className="backdrop-blur-md bg-[color:var(--ai-success)]/20 border border-[color:var(--ai-success)]/30 text-white font-medium shadow-lg">
                                    {t('status.completed')}
                                </Chip>
                            )}
                            {course.status === 'in-progress' && (
                                <Chip color="primary" variant="flat" size="sm" radius="lg" className="backdrop-blur-md bg-[color:var(--ai-primary)]/20 border border-[color:var(--ai-primary)]/30 text-white font-medium shadow-lg">
                                    {t('status.inProgress')}
                                </Chip>
                            )}
                            {course.status === 'not-started' && (
                                <Chip color="default" variant="flat" size="sm" radius="lg" className="backdrop-blur-md bg-white/20 border border-white/30 text-white font-medium shadow-lg">
                                    {t('status.notStarted')}
                                </Chip>
                            )}
                            {course.accessType === 'subscription' && (
                                <Chip color="warning" variant="flat" size="sm" radius="lg" className="backdrop-blur-md bg-amber-500/20 border border-amber-400/30 text-white font-medium shadow-lg">
                                    {t('status.subscriptionAccess')}
                                </Chip>
                            )}
                        </div>
                    </div>

                    {/* Course details */}
                    <div className="p-5 bg-[color:var(--ai-card-bg)]">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-foreground)]/70 bg-[color:var(--ai-card-bg)]/80 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20">
                                <FiClock className="mr-1.5 text-[color:var(--ai-primary)]" /> {course.duration || t('details.defaultDuration')}
                            </div>
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-foreground)]/70 bg-[color:var(--ai-card-bg)]/80 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20">
                                <FiLayers className="mr-1.5 text-[color:var(--ai-secondary)]" /> {course.totalLessons} {t('details.lessons')}
                            </div>
                            <div className="inline-flex items-center text-xs text-[color:var(--ai-foreground)]/70 bg-[color:var(--ai-card-bg)]/80 px-2 py-1 rounded-full border border-[color:var(--ai-card-border)]/20"
                                role="status"
                                aria-label={`Course progress: ${course.progress} percent complete`}>
                                <FiBarChart2 className="mr-1.5 text-[color:var(--ai-accent)]" aria-hidden="true" /> {course.progress}% {t('details.complete')}
                            </div>
                        </div>

                        <div className="text-sm text-[color:var(--ai-foreground)]/80 line-clamp-2 mb-5 h-10 leading-tight">
                            {course.description || t('details.noDescription')}
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                            <Button
                                as={Link}
                                href={`/courses/${course.courseId}`}
                                color="primary"
                                size="sm"
                                radius="lg"
                                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
                                aria-label={`View ${course.name} course details`}
                            >
                                {t('actions.viewCourse')}
                            </Button>

                            {course.recentLessonId && (
                                <Button
                                    as={Link}
                                    href={`/courses/${course.courseId}/lessons/${course.recentLessonId}`}
                                    color="default"
                                    variant="bordered"
                                    size="sm"
                                    radius="lg"
                                    className="border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] hover:bg-[color:var(--ai-primary)]/10 hover:border-[color:var(--ai-primary)] transition-all duration-200 rounded-xl"
                                    aria-label={`Continue learning ${course.name}`}
                                >
                                    {t('actions.continueLearning')}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.article>
    );
}
