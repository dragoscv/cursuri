'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FiBook, FiArrowLeft, FiAlertTriangle } from '@/components/icons/FeatherIcons';

interface LessonNotFoundProps {
    courseId?: string;
    lessonId?: string;
    courseExists?: boolean;
    message?: string;
    backToCoursePage?: boolean;
}

const LessonNotFound: React.FC<LessonNotFoundProps> = ({
    courseId,
    message = "The lesson you're looking for doesn't exist or you may not have access to it.",
    backToCoursePage = true,
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
            <div className="w-20 h-20 bg-[color:var(--ai-error)]/10 rounded-full flex items-center justify-center mb-6">
                <FiAlertTriangle size={32} className="text-[color:var(--ai-error)]" />
            </div>

            <h1 className="text-2xl font-bold mb-4 text-[color:var(--ai-foreground)]">
                Lesson Not Found
            </h1>

            <p className="mb-6 text-center max-w-md text-[color:var(--ai-muted)]">
                {message}
            </p>

            <div className="flex flex-wrap gap-4">
                {backToCoursePage && courseId && (
                    <Link href={`/courses/${courseId}`} passHref>
                        <Button
                            color="primary"
                            variant="solid"
                            startContent={<FiBook />}
                        >
                            Return to Course
                        </Button>
                    </Link>
                )}

                <Link href="/courses" passHref>
                    <Button
                        color="default"
                        variant="light"
                        startContent={<FiArrowLeft />}
                    >
                        Browse Courses
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default LessonNotFound;