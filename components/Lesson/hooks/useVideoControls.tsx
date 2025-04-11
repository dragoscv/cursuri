'use client'

import { useCallback, useRef, useState, useEffect } from 'react';
import { Lesson } from '@/types';

interface UseVideoControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    videoContainerRef: React.RefObject<HTMLDivElement | null>;
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    saveProgress: boolean;
    saveLessonProgress: (courseId: string, lessonId: string, position: number, isCompleted: boolean) => void;
    markLessonComplete: (courseId: string, lessonId: string) => void;
    setIsCompleted: (isCompleted: boolean) => void;
    setProgressSaved: (isSaved: boolean) => void;
}

export const useVideoControls = ({
    videoRef,
    videoContainerRef,
    courseId,
    lessonId,
    isCompleted,
    saveProgress,
    saveLessonProgress,
    markLessonComplete,
    setIsCompleted,
    setProgressSaved
}: UseVideoControlsProps) => {
    const [videoProgress, setVideoProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Save current progress to Firebase
    const saveCurrentProgress = useCallback(() => {
        if (!videoRef.current || !saveProgress) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;

        // Don't save if we're at the beginning or very end
        if (currentTime < 3 || (duration - currentTime) < 3) return;

        saveLessonProgress(courseId, lessonId, currentTime, isCompleted);
        setProgressSaved(true);

        // Show a temporary notification that progress was saved
        setTimeout(() => {
            setProgressSaved(false);
        }, 3000);
    }, [courseId, lessonId, saveLessonProgress, isCompleted, saveProgress, setProgressSaved, videoRef]);

    // Handle video time updates
    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setVideoProgress(progress);
            setIsPlaying(!videoRef.current.paused);

            // Auto-save progress every 15 seconds
            if (progressSaveTimerRef.current === null && saveProgress && !videoRef.current.paused) {
                progressSaveTimerRef.current = setTimeout(() => {
                    saveCurrentProgress();
                    progressSaveTimerRef.current = null;
                }, 15000); // Save every 15 seconds
            }
        }
    }, [saveProgress, saveCurrentProgress]);    // Handle mouse movement to show/hide controls
    const handleMouseMove = useCallback(() => {
        if (isPlaying) {
            setIsControlsVisible(true);

            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }

            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying && !isHovering) {
                    setIsControlsVisible(false);
                }
            }, 3000);
        }
    }, [isPlaying, isHovering]);
    // Handle mark as complete
    const handleMarkComplete = useCallback(() => {
        markLessonComplete(courseId, lessonId);
        setIsCompleted(true);
    }, [courseId, lessonId, markLessonComplete, setIsCompleted]);

    // Handle video ended event
    const handleVideoEnded = useCallback(() => {
        // Mark the lesson as completed when the video ends
        markLessonComplete(courseId, lessonId);
        setIsCompleted(true);
    }, [courseId, lessonId, markLessonComplete, setIsCompleted]);// Toggle play/pause
    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);

                // Hide controls after 3 seconds
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }
                controlsTimeoutRef.current = setTimeout(() => {
                    if (!isHovering) {
                        setIsControlsVisible(false);
                    }
                }, 3000);
            } else {
                videoRef.current.pause();
                // Save progress when paused
                saveCurrentProgress();
                setIsPlaying(false);
                setIsControlsVisible(true); // Always show controls on pause
            }
        }
    }, [isHovering, saveCurrentProgress, videoRef]);    // Seek forward or backward
    const seek = useCallback((seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            // Show controls briefly when seeking
            setIsControlsVisible(true);

            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }

            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    if (!isHovering) {
                        setIsControlsVisible(false);
                    }
                }, 3000);
            }
        }
    }, [isPlaying, isHovering, videoRef]);// Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
                videoContainerRef.current.requestFullscreen().then(() => {
                    setIsFullscreen(true);
                }).catch(err => {
                    console.error("Error attempting to enable fullscreen:", err);
                });
            } else {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                }).catch(err => {
                    console.error("Error attempting to exit fullscreen:", err);
                });
            }
        }
    }, [videoContainerRef]);

    // Format time for display
    const formatTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }, []);

    // Clean up timers when component unmounts
    useEffect(() => {
        return () => {
            if (progressSaveTimerRef.current) {
                clearTimeout(progressSaveTimerRef.current);
                progressSaveTimerRef.current = null;
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = null;
            }
            // Save current progress
            saveCurrentProgress();
        };
    }, [saveCurrentProgress]);

    return {
        videoProgress,
        isPlaying,
        isControlsVisible,
        isFullscreen,
        isHovering,
        setIsHovering,
        handleTimeUpdate,
        handleMouseMove,
        handleVideoEnded,
        handleMarkComplete,
        togglePlayPause,
        seek,
        toggleFullscreen,
        formatTime,
        saveCurrentProgress
    };
};

export default useVideoControls;