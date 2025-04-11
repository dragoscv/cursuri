'use client'

import { Button } from '@heroui/react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiMap } from '@/components/icons/FeatherIcons';

interface LessonNavigationProps {
    prevLessonId: string | null;
    nextLessonId: string | null;
    isCompleted: boolean;
    onNavigateLesson: (lessonId: string) => void;
    onClose?: () => void;
}

export default function LessonNavigation({
    prevLessonId,
    nextLessonId,
    isCompleted,
    onNavigateLesson,
    onClose
}: LessonNavigationProps) {
    return (
        <div className="w-full">
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/15 via-[color:var(--ai-secondary)]/15 to-[color:var(--ai-accent)]/10 py-4 px-6 border-b border-[color:var(--ai-card-border)]/50">
                <h3 className="font-semibold text-[color:var(--ai-foreground)] flex items-center">
                    <FiMap className="mr-2 text-[color:var(--ai-primary)]" size={18} />
                    <span>Lesson Navigation</span>
                </h3>
            </div>

            <div className="p-6 bg-[color:var(--ai-card-bg)]/30 flex flex-col gap-5">
                {/* Back to Course Button */}                {onClose && (
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
            </div>
        </div>
    );
}