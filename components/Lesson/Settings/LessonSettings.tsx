'use client'

import React, { useCallback } from 'react';
import { Button, Divider, Card } from '@heroui/react';
import { Lesson } from '@/types';

interface LessonSettingsProps {
    lesson: Lesson;
    isCompleted: boolean;
    autoPlayNext: boolean;
    saveProgress: boolean;
    setAutoPlayNext: (value: boolean) => void;
    setSaveProgress: (value: boolean) => void;
    saveLessonProgress: (courseId: string, lessonId: string, position: number, isCompleted: boolean) => void;
    markLessonComplete: (courseId: string, lessonId: string) => void;
}

export const LessonSettings: React.FC<LessonSettingsProps> = ({
    lesson,
    isCompleted,
    autoPlayNext,
    saveProgress,
    setAutoPlayNext,
    setSaveProgress,
    saveLessonProgress,
    markLessonComplete
}) => {
    const courseId = lesson?.courseId || '';

    // Handle manually marking a lesson as complete
    const handleMarkComplete = useCallback(() => {
        markLessonComplete(courseId, lesson.id);
    }, [courseId, lesson.id, markLessonComplete]);

    // Handle toggling autoplay preference
    const handleAutoPlayToggle = () => {
        const newValue = !autoPlayNext;
        setAutoPlayNext(newValue);
        localStorage.setItem('autoPlayNext', newValue.toString());
    };

    // Handle toggling save progress preference
    const handleSaveProgressToggle = () => {
        const newValue = !saveProgress;
        setSaveProgress(newValue);
        localStorage.setItem('saveProgress', newValue.toString());
    };

    // Handle manual save of progress
    const handleManualSave = () => {
        if (!lesson) return;

        const videoElement = document.querySelector('video');
        if (videoElement) {
            const currentTime = videoElement.currentTime;
            saveLessonProgress(courseId, lesson.id, currentTime, isCompleted);
        }
    };

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl overflow-hidden rounded-3xl">
            <div className="p-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                    Lesson Settings
                </h3>

                <div className="space-y-4">
                    {/* Mark as Complete Button */}
                    <Button
                        color={isCompleted ? "success" : "primary"}
                        className={`w-full ${isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]'
                            } text-white`}
                        disabled={isCompleted}
                        onClick={handleMarkComplete}
                        startContent={
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        }
                    >
                        {isCompleted ? "Lesson Completed" : "Mark as Complete"}
                    </Button>

                    <Divider className="my-3" />

                    {/* Auto-play Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-[color:var(--ai-text)]">Auto-play Next Lesson</span>
                            <span className="text-xs text-[color:var(--ai-muted)]">Automatically play the next lesson when this one ends</span>
                        </div>
                        <div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoPlayNext}
                                    onChange={handleAutoPlayToggle}
                                    className="sr-only peer"
                                    title="Auto-play Next Lesson"
                                />
                                <div className="w-11 h-6 bg-[color:var(--ai-card-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[color:var(--ai-card-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)]"></div>
                            </label>
                        </div>
                    </div>

                    {/* Save Progress Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-[color:var(--ai-text)]">Auto-save Progress</span>
                            <span className="text-xs text-[color:var(--ai-muted)]">Automatically save your position in the video</span>
                        </div>
                        <div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={saveProgress}
                                    onChange={handleSaveProgressToggle}
                                    className="sr-only peer"
                                    title="Auto-save Progress"
                                />
                                <div className="w-11 h-6 bg-[color:var(--ai-card-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[color:var(--ai-card-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)]"></div>
                            </label>
                        </div>
                    </div>

                    {/* Manual Save Button (if auto-save is off) */}
                    {!saveProgress && (
                        <Button
                            variant="flat"
                            size="sm"
                            className="w-full mt-2 bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10"
                            onClick={handleManualSave}
                            startContent={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Save Current Progress
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default LessonSettings;