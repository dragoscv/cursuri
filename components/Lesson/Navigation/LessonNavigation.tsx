'use client'

import { Button, Card, Divider } from '@heroui/react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiBookOpen, FiLayers, FiPlay, FiLock } from '@/components/icons/FeatherIcons';
import { useState } from 'react';

interface LessonItem {
    id: string;
    name: string;
    order?: number;
    isCompleted?: boolean;
    isCurrent?: boolean;
    isLocked?: boolean;
    durationMinutes?: number;
}

interface LessonNavigationProps {
    prevLessonId: string | null;
    nextLessonId: string | null;
    isCompleted: boolean;
    onNavigateLesson: (lessonId: string) => void;
    onClose?: () => void;
    lessons?: LessonItem[];
    currentLessonId?: string;
}

export default function LessonNavigation({
    prevLessonId,
    nextLessonId,
    isCompleted,
    onNavigateLesson,
    onClose,
    lessons = [],
    currentLessonId = ''
}: LessonNavigationProps) {
    const [expanded, setExpanded] = useState(false);

    // Format duration in minutes to "XX:XX" format
    const formatDuration = (minutes?: number) => {
        if (!minutes) return "00:00";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}${hrs > 0 ? '' : ' min'}`;
    };

    return (
        <div className="w-full">
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/15 via-[color:var(--ai-secondary)]/15 to-[color:var(--ai-accent)]/10 py-4 px-6 border-b border-[color:var(--ai-card-border)]/50">                <h3 className="font-semibold text-[color:var(--ai-foreground)] flex items-center justify-between">
                <div className="flex items-center">
                    <FiBookOpen className="mr-2 text-[color:var(--ai-primary)]" size={18} />
                    <span>Lesson Navigation</span>
                </div>
                {lessons && lessons.length > 0 && (
                    <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className="bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-primary)]/10"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <FiLayers size={16} />
                    </Button>
                )}
            </h3>
            </div>

            <div className="p-6 bg-[color:var(--ai-card-bg)]/30 flex flex-col gap-5">
                {/* Back to Course Button */}
                {onClose && (
                    <Button
                        variant="flat"
                        className="w-full bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 transition-all duration-300 text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)]/50 shadow-sm hover:shadow rounded-lg"
                        onClick={onClose}
                        startContent={<FiArrowLeft size={16} />}
                    >
                        Back to Course
                    </Button>
                )}

                {/* Previous & Next Lesson Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {prevLessonId ? (
                        <Button
                            variant="flat"
                            className="bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 transition-all duration-300 text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)]/50 shadow-sm hover:shadow rounded-lg"
                            onClick={() => onNavigateLesson(prevLessonId)}
                            startContent={<FiArrowLeft size={16} />}
                        >
                            Previous
                        </Button>
                    ) : (
                        <div></div> // Empty div for grid alignment when no previous lesson
                    )}

                    {nextLessonId ? (
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-lg"
                            onClick={() => onNavigateLesson(nextLessonId)}
                            endContent={<FiArrowRight size={16} />}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            className="bg-[color:var(--ai-success, #10b981)] text-white border-none shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-lg"
                            onClick={onClose}
                            endContent={<FiCheck size={16} />}
                        >
                            Complete
                        </Button>
                    )}
                </div>

                {/* Lesson List - Shows when expanded */}
                {(expanded || lessons.length > 0) && (
                    <div className={`mt-2 transition-all duration-300 ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>                        <Divider className="my-4" />
                        <div className="font-medium text-[color:var(--ai-foreground)] mb-3 flex items-center">
                            <FiLayers className="mr-2 text-[color:var(--ai-primary)]" size={16} />
                            <span>Lessons in this course</span>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className={`p-3 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 group 
                                        ${lesson.isCurrent || lesson.id === currentLessonId ?
                                            'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' :
                                            'hover:bg-[color:var(--ai-card-bg)]/80'}`}
                                    onClick={() => !lesson.isLocked && onNavigateLesson(lesson.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-1 rounded-full ${lesson.isCompleted ?
                                            'bg-[color:var(--ai-success)]/20 text-[color:var(--ai-success)]' :
                                            lesson.isLocked ? 'bg-[color:var(--ai-foreground-muted)]/20' :
                                                'bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)]'}`}
                                        >
                                            {lesson.isCompleted ?
                                                <FiCheck size={14} /> :
                                                lesson.isLocked ?
                                                    <FiLock size={14} /> :
                                                    <FiPlay size={14} />}
                                        </div>
                                        <div className="truncate">
                                            <p className={`text-sm font-medium truncate ${lesson.isLocked ? 'text-[color:var(--ai-foreground-muted)]' : ''}`}>
                                                {lesson.order && `${lesson.order}. `}{lesson.name}
                                            </p>
                                        </div>
                                    </div>

                                    {lesson.durationMinutes && (
                                        <span className="text-xs text-[color:var(--ai-foreground-muted)] whitespace-nowrap">
                                            {formatDuration(lesson.durationMinutes)}
                                        </span>
                                    )}
                                </div>
                            ))}

                            {lessons.length === 0 && (
                                <div className="p-4 text-center text-sm text-[color:var(--ai-foreground-muted)]">
                                    No lessons available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}