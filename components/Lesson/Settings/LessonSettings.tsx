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
        <div className="p-5">
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                    <FiClock className="mr-2 text-[color:var(--ai-primary)]" />
                    <span>Lesson Settings</span>
                </h3>
            </div>

            <div className="space-y-4">
                {/* Mark as Complete Button */}
                <Button
                    color={isCompleted ? "success" : "primary"}
                    className={`w-full ${isCompleted
                        ? 'bg-[color:var(--ai-success, #10b981)]'
                        : 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]'
                        } text-white border-none transition-transform hover:scale-[1.02]`}
                    isDisabled={isCompleted}
                    onClick={onMarkComplete}
                    startContent={<FiCheck size={18} />}
                >
                    {isCompleted ? "Lesson Completed" : "Mark as Complete"}
                </Button>

                <Divider className="my-3" />

                {/* Auto-play Toggle */}
                <div className="flex items-center justify-between">
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
                            <div className="w-11 h-6 bg-[color:var(--ai-card-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[color:var(--ai-card-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)]"></div>
                        </label>
                    </div>
                </div>

                {/* Save Progress Toggle */}
                <div className="flex items-center justify-between">
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
                            <div className="w-11 h-6 bg-[color:var(--ai-card-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[color:var(--ai-card-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)]"></div>
                        </label>
                    </div>
                </div>

                {/* Manual Save Button (if auto-save is off) */}
                {!saveProgress && (
                    <Button
                        variant="flat"
                        size="sm"
                        className="w-full mt-2 bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-foreground)]"
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