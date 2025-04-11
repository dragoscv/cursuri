'use client'

import React from 'react';
import { Divider, Card } from '@heroui/react';
import { Button } from '@heroui/react';
import { FiCheck, FiSave, FiPlayCircle, FiClock } from '@/components/icons/FeatherIcons';

interface LessonSettingsProps {
    isCompleted: boolean;
    autoPlayNext: boolean;
    saveProgress: boolean;
    onMarkComplete: () => void;
    onAutoPlayToggle: (value: boolean) => void;
    onSaveProgressToggle: (value: boolean) => void;
    onManualSave: () => void;
}

const LessonSettings: React.FC<LessonSettingsProps> = ({
    isCompleted,
    autoPlayNext,
    saveProgress,
    onMarkComplete,
    onAutoPlayToggle,
    onSaveProgressToggle,
    onManualSave
}) => {
    return (
        <div className="rounded-xl overflow-hidden backdrop-blur-sm border border-[color:var(--ai-card-border)] shadow-lg">
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/15 via-[color:var(--ai-secondary)]/15 to-[color:var(--ai-accent)]/10 py-4 px-5 border-b border-[color:var(--ai-card-border)]/50">
                <h3 className="font-semibold text-[color:var(--ai-foreground)] flex items-center">
                    <FiClock className="mr-2 text-[color:var(--ai-primary)]" size={18} />
                    <span>Lesson Settings</span>
                </h3>
            </div>

            <div className="p-5 bg-[color:var(--ai-card-bg)]/30 space-y-5">
                {/* Mark as Complete Button */}
                <Button
                    color={isCompleted ? "success" : "primary"}
                    className={`w-full ${isCompleted
                        ? 'bg-[color:var(--ai-success, #10b981)]'
                        : 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]'
                        } text-white border-none shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
                    isDisabled={isCompleted}
                    onClick={onMarkComplete}
                    startContent={<FiCheck size={18} />}
                >
                    {isCompleted ? "Lesson Completed" : "Mark as Complete"}
                </Button>

                <Divider className="opacity-50" />

                {/* Auto-play Toggle */}
                <div className="flex items-center justify-between p-2 bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/30 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-[color:var(--ai-foreground)]">Auto-play Next Lesson</span>
                        <span className="text-xs text-[color:var(--ai-muted)]">Automatically play the next lesson when this one ends</span>
                    </div>
                    <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoPlayNext}
                                onChange={() => onAutoPlayToggle(!autoPlayNext)}
                                className="sr-only peer"
                                title="Auto-play Next Lesson"
                            />
                            <div className="w-11 h-6 bg-[color:var(--ai-card-border)]/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[color:var(--ai-card-border)]/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)] shadow-inner"></div>
                        </label>
                    </div>
                </div>

                {/* Save Progress Toggle */}
                <div className="flex items-center justify-between p-2 bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/30 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-[color:var(--ai-foreground)]">Auto-save Progress</span>
                        <span className="text-xs text-[color:var(--ai-muted)]">Automatically save your position in the video</span>
                    </div>
                    <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={saveProgress}
                                onChange={() => onSaveProgressToggle(!saveProgress)}
                                className="sr-only peer"
                                title="Auto-save Progress"
                            />
                            <div className="w-11 h-6 bg-[color:var(--ai-card-border)]/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[color:var(--ai-card-border)]/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)] shadow-inner"></div>
                        </label>
                    </div>
                </div>

                {/* Manual Save Button (if auto-save is off) */}
                {!saveProgress && (
                    <Button
                        variant="flat"
                        size="sm"
                        className="w-full bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)]/50 shadow-sm transition-all duration-300 hover:shadow"
                        onClick={onManualSave}
                        startContent={<FiSave size={16} />}
                    >
                        Save Current Progress
                    </Button>
                )}
            </div>
        </div>
    );
};

export default LessonSettings;