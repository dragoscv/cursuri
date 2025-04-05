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

            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 dark:border-[color:var(--ai-card-border)]/50 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">
                            {courseName}
                        </h1>
                        <p className="text-[color:var(--ai-foreground)]/80 dark:text-[color:var(--ai-foreground)]/70">
                            {lessonCount} lessons • {difficulty || 'All levels'}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="bg-white/80 dark:bg-[color:var(--ai-background)]/80 rounded-full px-4 py-2 shadow-sm border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]/50">
                            <div className="flex items-center gap-2">
                                <div className="relative w-32 bg-[color:var(--ai-card-border)]/20 dark:bg-[color:var(--ai-card-border)]/30 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/60 animate-pulse rounded-full"
                                        style={{ width: '30%' }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-[color:var(--ai-foreground)]/70 dark:text-[color:var(--ai-foreground)]/60">
                                    Loading...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 dark:bg-[color:var(--ai-background)]/80 rounded-full px-4 py-2 shadow-sm border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]/50">
                            <div className="flex items-center gap-2">
                                <div className="relative w-32 bg-[color:var(--ai-card-border)]/20 dark:bg-[color:var(--ai-card-border)]/30 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-[color:var(--ai-primary)] dark:text-[color:var(--ai-primary)]/90">
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