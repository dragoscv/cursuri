'use client'

import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { AppContext } from "../AppContext";
import { Button, Card, Progress } from "@heroui/react";
import { useRouter } from "next/navigation";
import LessonContent from "./LessonContent";
import LessonNavigation from "./Navigation/LessonNavigation";
import LessonSettings from "./Settings/LessonSettings";
import LessonNotes from "./Notes/LessonNotes";
import LessonResources from "./Resources/LessonResources";
import QASection from "./QA/QASection";
import { Lesson as LessonInterface, AppContextProps } from "@/types";

interface LessonProps {
    lesson: LessonInterface;
    onClose?: () => void;
}

export default function Lesson({ lesson, onClose }: LessonProps) {
    const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    const [autoPlayNext, setAutoPlayNext] = useState(true);
    const [saveProgress, setSaveProgress] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [noteContent, setNoteContent] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    const context = useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }

    const { lessons, lessonProgress, saveLessonProgress, markLessonComplete } = context;
    const courseId = lesson.courseId || '';

    // Find previous and next lessons for navigation
    useEffect(() => {
        if (courseId && lessons[courseId]) {
            const courseLessons = Object.values(lessons[courseId])
                .sort((a: LessonInterface, b: LessonInterface) => {
                    const orderA = a.order || 0;
                    const orderB = b.order || 0;
                    return orderA - orderB;
                });

            const currentIndex = courseLessons.findIndex((l: LessonInterface) => l.id === lesson.id);

            if (currentIndex > 0) {
                setPrevLessonId(courseLessons[currentIndex - 1].id);
            } else {
                setPrevLessonId(null);
            }

            if (currentIndex < courseLessons.length - 1) {
                setNextLessonId(courseLessons[currentIndex + 1].id);
            } else {
                setNextLessonId(null);
            }
        }
    }, [lesson.id, courseId, lessons]);

    // Load saved progress and completion status
    useEffect(() => {
        // Load auto-play preference from localStorage
        const savedAutoPlay = localStorage.getItem('autoPlayNext');
        if (savedAutoPlay !== null) {
            setAutoPlayNext(savedAutoPlay === 'true');
        }

        // Load save progress preference from localStorage
        const savedProgressPref = localStorage.getItem('saveProgress');
        if (savedProgressPref !== null) {
            setSaveProgress(savedProgressPref === 'true');
        }

        // Check if we have progress data for this lesson
        if (lessonProgress &&
            lessonProgress[courseId] &&
            lessonProgress[courseId][lesson.id]) {

            const progress = lessonProgress[courseId][lesson.id];

            // Set completion status
            setIsCompleted(progress.isCompleted);

            // Set video progress if we have it
            if (progress.videoProgress !== undefined) {
                setVideoProgress(progress.videoProgress);
            }

            // Set notes if we have them
            if (progress.notes) {
                setNoteContent(progress.notes);
            }
        }
    }, [lesson.id, courseId, lessonProgress]);

    // Handle video time update - track progress
    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const progress = (video.currentTime / video.duration) * 100;
        setVideoProgress(progress);

        // Auto-save progress if enabled
        if (saveProgress && progress > 0) {
            // Save every 5 seconds to avoid too many writes
            if (Math.floor(video.currentTime) % 5 === 0) {
                saveCurrentProgress();
            }
        }

        // Mark as completed when near the end (95%)
        if (progress > 95 && !isCompleted) {
            handleMarkComplete();
        }

        // Auto-play next lesson if enabled and video ended
        if (autoPlayNext && video.ended && nextLessonId) {
            setTimeout(() => {
                navigateToLesson(nextLessonId);
            }, 2000); // Give user a moment before navigating
        }
    }, [videoRef, saveProgress, autoPlayNext, nextLessonId, isCompleted]);

    // Save current progress to context/backend
    const saveCurrentProgress = useCallback(() => {
        if (!saveProgress || !videoRef.current) return;

        const videoProgress = videoRef.current ? 
            (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0;

        saveLessonProgress(courseId, lesson.id, {
            videoProgress,
            notes: noteContent,
            isCompleted,
            lastUpdated: new Date()
        });
    }, [courseId, lesson.id, saveProgress, videoRef, noteContent, isCompleted, saveLessonProgress]);

    // Handle marking lesson as complete
    const handleMarkComplete = useCallback(() => {
        setIsCompleted(true);
        markLessonComplete(courseId, lesson.id);
    }, [courseId, lesson.id, markLessonComplete]);

    // Handle toggling auto-play preference
    const handleAutoPlayToggle = useCallback((value: boolean) => {
        setAutoPlayNext(value);
        localStorage.setItem('autoPlayNext', value.toString());
    }, []);

    // Handle toggling save progress preference
    const handleSaveProgressToggle = useCallback((value: boolean) => {
        setSaveProgress(value);
        localStorage.setItem('saveProgress', value.toString());
    }, []);

    // Navigate to a different lesson
    const navigateToLesson = (lessonId: string) => {
        if (lessonId) {
            // Save progress before navigating
            saveCurrentProgress();
            router.push(`/courses/${courseId}/lessons/${lessonId}`);
        }
    };

    // Calculate progress percentage for the progress bar
    const calculateProgress = () => {
        if (!lessons[courseId]) return 0;

        const totalLessons = Object.keys(lessons[courseId]).length;
        if (totalLessons === 0) return 0;

        // Find current lesson index
        const sortedLessons = Object.values(lessons[courseId])
            .sort((a: LessonInterface, b: LessonInterface) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });

        const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
        return ((currentIndex + 1) / totalLessons) * 100;
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player Section */}
                    {lesson.videoUrl && (
                        <Card className="border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]/50 bg-white/50 dark:bg-[color:var(--ai-background)]/50 backdrop-blur-sm shadow-xl overflow-hidden">
                            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                                <video
                                    ref={videoRef}
                                    className="absolute inset-0 w-full h-full bg-black"
                                    src={lesson.videoUrl}
                                    poster={lesson.thumbnailUrl}
                                    controls
                                    onTimeUpdate={handleTimeUpdate}
                                ></video>
                            </div>

                            {/* Progress bar for the video */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {lesson.title || lesson.name}
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {lesson.duration || "Tutorial"}
                                    </span>
                                </div>

                                {/* Video progress indicator */}
                                <Progress
                                    value={videoProgress}
                                    color="primary"
                                    size="sm"
                                    radius="full"
                                    className="mb-2"
                                />

                                {/* Course progress indicator */}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Lesson {calculateProgress() / (100 / Object.keys(lessons[courseId] || {}).length)} of {Object.keys(lessons[courseId] || {}).length}</span>
                                    <span>{Math.round(calculateProgress())}% of course completed</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Lesson Content */}
                    {lesson.content && (
                        <Card className="mt-8 border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]/50 bg-white/50 dark:bg-[color:var(--ai-background)]/50 backdrop-blur-sm shadow-xl">
                            <div className="p-6">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                                    Lesson Content
                                </h2>
                                <div
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                                />
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Lesson Navigation */}
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                        <LessonNavigation
                            prevLessonId={prevLessonId}
                            nextLessonId={nextLessonId}
                            isCompleted={isCompleted}
                            onNavigateLesson={navigateToLesson}
                            onClose={onClose}
                        />
                    </Card>

                    {/* Lesson Settings */}
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                        <LessonSettings
                            isCompleted={isCompleted}
                            autoPlayNext={autoPlayNext}
                            saveProgress={saveProgress}
                            onMarkComplete={handleMarkComplete}
                            onAutoPlayToggle={handleAutoPlayToggle}
                            onSaveProgressToggle={handleSaveProgressToggle}
                            onManualSave={saveCurrentProgress}
                        />
                    </Card>

                    {/* Notes Section */}
                    <LessonNotes
                        notes={noteContent}
                        onChange={setNoteContent}
                        onSave={() => saveCurrentProgress()}
                    />

                    {/* Additional Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <LessonResources resources={lesson.resources} />
                    )}
                </div>
            </div>

            {/* Q&A Section */}
            <div className="mt-8">
                <QASection lessonId={lesson.id} />
            </div>
        </div>
    );
}