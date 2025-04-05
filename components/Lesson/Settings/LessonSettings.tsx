'use client'

import { Button, Divider } from '@heroui/react'

interface LessonSettingsProps {
    isCompleted: boolean;
    autoPlayNext: boolean;
    saveProgress: boolean;
    onMarkComplete: () => void;
    onAutoPlayToggle: () => void;
    onSaveProgressToggle: () => void;
    onManualSave: () => void;
}

export default function LessonSettings({
    isCompleted,
    autoPlayNext,
    saveProgress,
    onMarkComplete,
    onAutoPlayToggle,
    onSaveProgressToggle,
    onManualSave
}: LessonSettingsProps) {
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Lesson Settings
            </h3>

            <div className="space-y-4">
                {/* Mark as Complete Button */}
                <Button
                    color={isCompleted ? "success" : "primary"}
                    className={`w-full ${isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        } text-white`}
                    disabled={isCompleted}
                    onClick={onMarkComplete}
                    startContent={
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    }
                >
                    {isCompleted ? "Lesson Completed" : "Mark as Complete"}
                </Button>

                <Divider className="my-3" />

                {/* Auto-play Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-play Next Lesson</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Automatically play the next lesson when this one ends</span>
                    </div>
                    <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoPlayNext}
                                onChange={onAutoPlayToggle}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>

                {/* Save Progress Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save Progress</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Automatically save your position in the video</span>
                    </div>
                    <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={saveProgress}
                                onChange={onSaveProgressToggle}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>

                {/* Manual Save Button (if auto-save is off) */}
                {!saveProgress && (
                    <Button
                        variant="flat"
                        size="sm"
                        className="w-full mt-2 bg-gray-100 dark:bg-gray-700/50"
                        onClick={onManualSave}
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
    )
}