'use client'

import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useTranslations } from 'next-intl';
import { AppContext } from "../AppContext";
import { Card, Progress } from "@heroui/react";
import Button from '@/components/ui/Button';
import { useRouter } from "next/navigation";
import LessonContent from "@/components/Lesson/LessonContent";
import LessonNavigation from "@/components/Lesson/Navigation/LessonNavigation";
import LessonSettings from "@/components/Lesson/Settings/LessonSettings";
import LessonNotes from "@/components/Lesson/Notes/LessonNotes";
import LessonResources from "@/components/Lesson/Resources/LessonResources";
import QASection from "@/components/Lesson/QA/QASection";
import { Lesson as LessonInterface, AppContextProps, LessonResource, LessonProps } from "@/types";
import { useToast } from "@/components/Toast";
import { FiBookmark, FiBookmarkFilled } from '@/components/icons/FeatherIcons';

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
    const toast = useToast();
    const t = useTranslations('common.notifications');
    const tLesson = useTranslations('courses.lesson');

    const context = useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }

    const { lessons, lessonProgress, saveLessonProgress, markLessonComplete, bookmarkedLessons, toggleBookmarkLesson } = context;
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
            (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0;        // Pass position as the third parameter (videoProgress as a number)
        saveLessonProgress(courseId, lesson.id, videoProgress, isCompleted);
    }, [courseId, lesson.id, saveProgress, videoRef, noteContent, isCompleted, saveLessonProgress]);

    // Handle marking lesson as complete
    const handleMarkComplete = useCallback(() => {
        setIsCompleted(true);
        try {
            markLessonComplete(courseId, lesson.id);
            toast.showToast({
                type: 'success',
                title: t('success.lessonCompleted'),
                message: t('success.lessonCompletedMessage'),
                duration: 4000
            });
        } catch (error) {
            toast.showToast({
                type: 'error',
                title: t('error.markCompleteFailed'),
                message: t('error.markCompleteFailedMessage'),
                duration: 6000
            });
        }
    }, [courseId, lesson.id, markLessonComplete, toast, t]);

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

    // Bookmark state
    const isBookmarked = bookmarkedLessons?.[courseId]?.includes(lesson.id);
    const handleBookmark = () => {
        toggleBookmarkLesson(courseId, lesson.id);
    };

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
    }; return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Lesson Navigation */}
                    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden w-full">
                        <div className="p-0">
                            <LessonNavigation
                                prevLessonId={prevLessonId}
                                nextLessonId={nextLessonId}
                                isCompleted={isCompleted}
                                onNavigateLesson={navigateToLesson}
                                onClose={onClose}
                                lessons={Object.values(lessons[courseId] || {}).sort((a, b) => (a.order || 0) - (b.order || 0)).map(l => ({
                                    id: l.id,
                                    name: l.name,
                                    order: l.order,
                                    isCompleted: lessonProgress?.[courseId]?.[l.id]?.isCompleted,
                                    isCurrent: l.id === lesson.id,
                                    isLocked: false, // TODO: implement lock logic if needed
                                    durationMinutes: l.duration ? parseInt(l.duration) : undefined
                                }))}
                                currentLessonId={lesson.id}
                            />
                        </div>
                    </Card>

                    {/* Video Player Section */}
                    {lesson.videoUrl && (
                        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md overflow-hidden rounded-xl">
                            <div className="relative w-full aspect-video">
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
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
                                        {lesson.title || lesson.name}
                                    </h3>
                                    <span className="text-sm text-[color:var(--ai-muted)]">
                                        {lesson.duration || tLesson('tutorial')}
                                    </span>
                                </div>

                                {/* Video progress indicator */}                            <Progress
                                    value={videoProgress}
                                    color="primary"
                                    size="sm"
                                    radius="full"
                                    className="mb-2"
                                    aria-label="Video playback progress"
                                />

                                {/* Course progress indicator */}
                                <div className="flex items-center justify-between text-xs text-[color:var(--ai-muted)]">
                                    <span>{tLesson('lessonCount', { current: Math.ceil(calculateProgress() / (100 / Object.keys(lessons[courseId] || {}).length)), total: Object.keys(lessons[courseId] || {}).length })}</span>
                                    <span>{tLesson('courseProgress', { progress: Math.round(calculateProgress()) })}</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Lesson Content */}
                    {lesson.content && (
                        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl">
                            <div className="p-6">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                                    {tLesson('lessonContent')}
                                </h2>
                                <div
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                                />
                            </div>
                        </Card>
                    )}                {/* Q&A Section - Moved into main content column */}
                    <QASection lessonId={lesson.id} courseId={courseId} />
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Bookmark Button */}
                    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden flex items-center justify-between px-6 py-4">
                        <span className="font-medium text-[color:var(--ai-foreground)]">{tLesson('bookmarkLesson')}</span>
                        <button
                            aria-label={isBookmarked ? tLesson('removeBookmark') : tLesson('bookmarkLessonAction')}
                            onClick={handleBookmark}
                            className={`btn-icon ${isBookmarked ? 'text-[color:var(--ai-primary)]' : 'text-[color:var(--ai-muted)]'} transition-colors duration-200`}
                        >
                            {isBookmarked ? <FiBookmarkFilled size={22} /> : <FiBookmark size={22} />}
                        </button>
                    </Card>

                    {/* Lesson Settings */}
                    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
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
                    />                    {/* Additional Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <LessonResources
                            resources={
                                lesson.resources.map((r: LessonResource) => ({
                                    name: r.name || r.title || '',
                                    url: r.url || '',
                                    type: r.type,
                                    description: r.description
                                }))
                            }
                        />)}
                </div>
            </div>
        </div>
    );
}