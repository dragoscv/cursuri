'use client'

import Button from '@/components/ui/Button'

interface LessonNavigationProps {
    prevLessonId: string | null;
    nextLessonId: string | null;
    isCompleted: boolean;
    onNavigateLesson: (lessonId: string) => void;
    onClose: () => void;
}

export default function LessonNavigation({
    prevLessonId,
    nextLessonId,
    isCompleted,
    onNavigateLesson,
    onClose
}: LessonNavigationProps) {
    return (
        <div className="p-6 rounded-3xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl overflow-hidden mt-8">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4 rounded-3xl">
                Lesson Navigation
            </h3>

            <div className="flex flex-col gap-3">
                {/* Back to Course Button */}
                <Button
                    variant="flat"
                    className="bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 transition-colors rounded-lg"
                    onClick={onClose}
                    startContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    }
                >
                    Back to Course
                </Button>

                {/* Previous & Next Lesson Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {prevLessonId ? (
                        <Button
                            variant="flat"
                            className="bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 transition-colors rounded-lg"
                            onClick={() => onNavigateLesson(prevLessonId)}
                            startContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            }
                        >
                            Previous
                        </Button>
                    ) : (
                        <div></div> // Empty div for grid alignment when no previous lesson
                    )}

                    {nextLessonId ? (
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg"
                            onClick={() => onNavigateLesson(nextLessonId)}
                            endContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            }
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg"
                            onClick={onClose}
                            endContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                        >
                            Complete
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}