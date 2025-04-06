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
        <div className="p-5">
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                    <FiMap className="mr-2 text-[color:var(--ai-primary)]" />
                    <span>Lesson Navigation</span>
                </h3>
            </div>

            <div className="flex flex-col gap-3">
                {/* Back to Course Button */}
                {onClose && (
                    <Button
                        variant="flat"
                        className="bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 transition-colors text-[color:var(--ai-foreground)]"
                        onClick={onClose}
                        startContent={<FiArrowLeft size={16} />}
                    >
                        Back to Course
                    </Button>
                )}

                {/* Previous & Next Lesson Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {prevLessonId ? (
                        <Button
                            variant="flat"
                            className="bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 transition-colors text-[color:var(--ai-foreground)]"
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
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none transition-transform hover:scale-[1.02]"
                            onClick={() => onNavigateLesson(nextLessonId)}
                            endContent={<FiArrowRight size={16} />}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            className="bg-[color:var(--ai-success, #10b981)] text-white border-none transition-transform hover:scale-[1.02]"
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