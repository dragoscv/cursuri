'use client'

import React from 'react';
import { Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiClock, FiCheck, FiLock } from '@/components/icons/FeatherIcons';
import { Lesson } from '@/types';

interface LessonHeaderProps {
    lesson: Lesson;
    onBack: () => void;
    isCompleted: boolean;
    hasAccess: boolean;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({
    lesson,
    onBack,
    isCompleted,
    hasAccess
}) => {
    return (
        <div className="p-5 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)]/50 shadow-sm mb-6">            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <Button
                variant="light"
                size="sm"
                onClick={onBack}
                className="p-0 min-w-0 text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] bg-transparent"
                startContent={<FiArrowLeft />}
            >
                <span className="text-sm">Back to course</span>
            </Button>

            <div className="flex items-center gap-2">
                {lesson.duration && (
                    <div className="flex items-center text-[color:var(--ai-muted)]">
                        <FiClock className="mr-1" size={14} />
                        <span className="text-sm">{lesson.duration}</span>
                    </div>
                )}

                {isCompleted ? (
                    <Chip
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<FiCheck size={12} />}
                        className="text-[color:var(--ai-success, #10b981)]"
                    >
                        Completed
                    </Chip>
                ) : !hasAccess ? (
                    <Chip
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<FiLock size={12} />}
                        className="text-[color:var(--ai-danger, #f43f5e)]"
                    >
                        Locked
                    </Chip>
                ) : lesson.isFree ? (
                    <Chip
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="text-[color:var(--ai-primary)]"
                    >
                        Free Preview
                    </Chip>
                ) : null}
            </div>
        </div>

            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                {lesson.title || lesson.name}
            </h1>

            {lesson.description && (
                <p className="text-[color:var(--ai-muted)] mt-2 max-w-3xl">
                    {lesson.description}
                </p>
            )}
        </div>
    );
};

export default LessonHeader;