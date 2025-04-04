'use client'

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AppContext } from '../../components/AppContext';
import { Lesson, AppContextProps, Resource } from '@/types';
import { Button, Card, Chip, Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useRouter } from 'next/navigation';

interface LessonContentProps {
    lesson: Lesson;
}

export const LessonContent: React.FC<LessonContentProps> = ({ lesson }) => {
    const [videoProgress, setVideoProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [autoPlayNext, setAutoPlayNext] = useState(false);
    const [saveProgress, setSaveProgress] = useState(true);
    const [progressSaved, setProgressSaved] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const notesRef = useRef<HTMLTextAreaElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const context = useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("AppContext is required");
    }

    const { lessons, lessonProgress, saveLessonProgress, markLessonComplete } = context;
    const courseId = lesson.courseId || '';

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

            // If not completed and we have a saved position, set it
            if (!progress.isCompleted && progress.lastPosition > 0 && videoRef.current) {
                // Only resume if we're more than 5 seconds into the video and not at the end
                if (progress.lastPosition > 5 &&
                    (videoRef.current.duration - progress.lastPosition) > 3) {
                    videoRef.current.currentTime = progress.lastPosition;
                    setProgressSaved(true);

                    // Show the saved progress notification
                    setTimeout(() => {
                        setProgressSaved(false);
                    }, 3000);
                }
            }
        }
    }, [courseId, lesson.id, lessonProgress]);

    // Save progress when component unmounts or video is paused
    const saveCurrentProgress = useCallback(() => {
        if (!videoRef.current || !saveProgress) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;

        // Don't save if we're at the beginning or very end
        if (currentTime < 3 || (duration - currentTime) < 3) return;

        saveLessonProgress(courseId, lesson.id, currentTime, isCompleted);
        setProgressSaved(true);

        // Show a temporary notification that progress was saved
        setTimeout(() => {
            setProgressSaved(false);
        }, 3000);
    }, [courseId, lesson.id, saveLessonProgress, isCompleted, saveProgress]);

    // Handle video events
    const handleTimeUpdate = () => {
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
    };

    // Reset the controls timeout when mouse moves or on interaction
    const handleMouseMove = () => {
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
    };

    // Check if video ended, and if auto-play is on, go to next lesson
    const handleVideoEnded = () => {
        // Mark the lesson as completed when the video ends
        handleMarkComplete();
    };

    // Handle manually marking a lesson as complete
    const handleMarkComplete = useCallback(() => {
        markLessonComplete(courseId, lesson.id);
        setIsCompleted(true);
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

    // Save notes to localStorage
    useEffect(() => {
        const savedNotes = localStorage.getItem(`lesson-notes-${lesson.id}`);
        if (savedNotes) {
            setNotes(savedNotes);
        }
    }, [lesson.id]);

    const saveNotes = () => {
        if (notes.trim()) {
            localStorage.setItem(`lesson-notes-${lesson.id}`, notes);
            // Show saved notification briefly
            setProgressSaved(true);
            setTimeout(() => {
                setProgressSaved(false);
            }, 2000);
        }
    };

    // Save progress when the component unmounts
    useEffect(() => {
        return () => {
            // Clear any active timers
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

    const togglePlayPause = () => {
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
    };

    const seek = (seconds: number) => {
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
    };

    const toggleFullscreen = () => {
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
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Calculate progress percentage for the progress bar
    const calculateProgress = () => {
        if (!lessons[courseId]) return 0;

        const totalLessons = Object.keys(lessons[courseId]).length;
        if (totalLessons === 0) return 0;

        // Find current lesson index
        const sortedLessons = Object.values(lessons[courseId])
            .sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });

        const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
        return ((currentIndex + 1) / totalLessons) * 100;
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Space for play/pause
            if (e.code === 'Space' && !notesRef.current?.contains(document.activeElement)) {
                e.preventDefault();
                togglePlayPause();
            }

            // Arrow keys for seeking
            if (e.code === 'ArrowRight' && !notesRef.current?.contains(document.activeElement)) {
                e.preventDefault();
                seek(10); // Forward 10 seconds
            }

            if (e.code === 'ArrowLeft' && !notesRef.current?.contains(document.activeElement)) {
                e.preventDefault();
                seek(-10); // Back 10 seconds
            }

            // F key for fullscreen
            if (e.code === 'KeyF' && !notesRef.current?.contains(document.activeElement)) {
                e.preventDefault();
                toggleFullscreen();
            }

            // M key for mute/unmute
            if (e.code === 'KeyM' && !notesRef.current?.contains(document.activeElement)) {
                e.preventDefault();
                if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {lesson.name}
                        </h1>
                        {lesson.description && (
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                                {lesson.description}
                            </p>
                        )}
                    </div>

                    {/* Course Progress Indicator */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Course Progress</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{Math.round(calculateProgress())}%</span>
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                                style={{ width: `${calculateProgress()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Status indicators */}
                <div className="flex flex-wrap items-center gap-2">
                    {isCompleted && (
                        <Chip
                            color="success"
                            variant="flat"
                            className="transition-all duration-300"
                            startContent={
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                            }
                        >
                            Completed
                        </Chip>
                    )}

                    {progressSaved && (
                        <Chip
                            color="primary"
                            variant="flat"
                            className="animate-pulse"
                            startContent={
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
                                </svg>
                            }
                        >
                            Progress Saved
                        </Chip>
                    )}

                    {autoPlayNext && (
                        <Chip
                            color="warning"
                            variant="flat"
                            startContent={
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
                                </svg>
                            }
                        >
                            Autoplay Next
                        </Chip>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Video Player Container */}
                    {lesson.file && (
                        <div
                            ref={videoContainerRef}
                            className="relative overflow-hidden rounded-2xl bg-black shadow-2xl group"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => {
                                setIsHovering(false);
                                if (isPlaying) {
                                    // Hide controls when mouse leaves if playing
                                    if (controlsTimeoutRef.current) {
                                        clearTimeout(controlsTimeoutRef.current);
                                    }
                                    controlsTimeoutRef.current = setTimeout(() => {
                                        setIsControlsVisible(false);
                                    }, 1000);
                                }
                            }}
                        >
                            {/* Video Element */}
                            <video
                                ref={videoRef}
                                src={lesson.file}
                                className="w-full aspect-video bg-black"
                                onTimeUpdate={handleTimeUpdate}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={handleVideoEnded}
                                playsInline
                                preload="metadata"
                                onClick={togglePlayPause}
                            />

                            {/* Custom Play Button Overlay */}
                            {!isPlaying && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                                    onClick={togglePlayPause}
                                >
                                    <div className="rounded-full bg-white/20 hover:bg-white/30 p-5 backdrop-blur-sm transition-all duration-300 transform hover:scale-110">
                                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Video Controls Overlay */}
                            <div
                                className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                            >
                                {/* Progress Bar */}
                                <div className="relative w-full mb-2">
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                                        onClick={(e) => {
                                            if (videoRef.current) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const clickPosition = (e.clientX - rect.left) / rect.width;
                                                videoRef.current.currentTime = clickPosition * videoRef.current.duration;
                                            }
                                        }}
                                    >
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                            style={{ width: `${videoProgress}%` }}
                                        ></div>
                                    </div>

                                    {/* Buffered Progress */}
                                    <div className="absolute left-0 top-0 h-1.5 bg-gray-400/30 pointer-events-none"
                                        style={{
                                            width: `${videoRef.current && videoRef.current.buffered.length > 0
                                                ? (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / videoRef.current.duration) * 100
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>

                                {/* Controls Row */}
                                <div className="flex items-center justify-between text-white gap-4">
                                    <div className="flex items-center gap-3">
                                        {/* Rewind */}
                                        <button
                                            className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
                                            onClick={() => seek(-10)}
                                            aria-label="Rewind 10 seconds"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12.5 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9h-2a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7v3l6-4-6-4v3Z" />
                                            </svg>
                                        </button>

                                        {/* Play/Pause */}
                                        <button
                                            className="p-2 rounded-full hover:bg-white/20 transition duration-300"
                                            onClick={togglePlayPause}
                                            aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                        >
                                            {isPlaying ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Forward */}
                                        <button
                                            className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
                                            onClick={() => seek(10)}
                                            aria-label="Forward 10 seconds"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M10.5 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9h2a7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7v3l-6-4 6-4v3Z" />
                                            </svg>
                                        </button>

                                        {/* Time Display */}
                                        <span className="text-sm font-medium ml-2">
                                            {videoRef.current
                                                ? `${formatTime(videoRef.current?.currentTime || 0)} / ${formatTime(videoRef.current?.duration || 0)}`
                                                : '0:00 / 0:00'
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Playback Speed */}
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <button className="p-1.5 rounded-full hover:bg-white/20 transition duration-300 text-sm flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M10 8v8l6-4-6-4zm6.33-1.17a8.03 8.03 0 0 1 2.93 7.83 8.01 8.01 0 0 1-6.93 6.13 8.1 8.1 0 0 1-8.16-3.08 7.97 7.97 0 0 1-1.33-8.17 8 8 0 0 1 7.16-4.37c2.21 0 4.21.89 5.67 2.33l1.41-1.41A10 10 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07l-1.41 1.41z" />
                                                    </svg>
                                                    <span>
                                                        {videoRef.current?.playbackRate || 1}x
                                                    </span>
                                                </button>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                aria-label="Playback speed"
                                                className="bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white"
                                                onAction={(key) => {
                                                    if (videoRef.current) {
                                                        videoRef.current.playbackRate = parseFloat(key.toString());
                                                    }
                                                }}
                                            >
                                                <DropdownItem key="0.5">0.5x</DropdownItem>
                                                <DropdownItem key="0.75">0.75x</DropdownItem>
                                                <DropdownItem key="1">1x (Normal)</DropdownItem>
                                                <DropdownItem key="1.25">1.25x</DropdownItem>
                                                <DropdownItem key="1.5">1.5x</DropdownItem>
                                                <DropdownItem key="2">2x</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>

                                        {/* Mark Complete Button */}
                                        <button
                                            className={`p-1.5 rounded-full transition duration-300 ${isCompleted
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'hover:bg-white/20 text-white'
                                                }`}
                                            onClick={handleMarkComplete}
                                            disabled={isCompleted}
                                            aria-label={isCompleted ? "Lesson completed" : "Mark lesson as complete"}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        </button>

                                        {/* Fullscreen Toggle */}
                                        <button
                                            className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
                                            onClick={toggleFullscreen}
                                            aria-label="Toggle fullscreen"
                                        >
                                            {isFullscreen ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Keyboard Shortcuts Info - Show briefly on load */}
                            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    <span>Space</span>
                                    <span>Play/Pause</span>
                                    <span>←/→</span>
                                    <span>Seek ±10s</span>
                                    <span>F</span>
                                    <span>Fullscreen</span>
                                    <span>M</span>
                                    <span>Mute</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lesson Content */}
                    {lesson.content && (
                        <Card className="mt-8 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
                            <div className="p-6">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    Lesson Content
                                </h2>
                                <div
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Quiz Section (if lesson has a quiz) */}
                    {lesson.hasQuiz && (
                        <Card className="mt-6 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    Knowledge Check
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Test your understanding of the key concepts covered in this lesson.
                                </p>
                                <Button
                                    color="primary"
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
                                    endContent={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    }
                                >
                                    Start Quiz
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Progress Settings */}
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-play Next Lesson</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Automatically play the next lesson when this one ends</span>
                                    </div>
                                    <div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoPlayNext}
                                                onChange={handleAutoPlayToggle}
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
                                                onChange={handleSaveProgressToggle}
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
                                        onClick={saveCurrentProgress}
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

                    {/* Notes Section */}
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Your Notes
                                </h3>
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="text-indigo-600 dark:text-indigo-400"
                                    endContent={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showNotes ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                                        </svg>
                                    }
                                >
                                    {showNotes ? 'Hide' : 'Show'}
                                </Button>
                            </div>

                            {showNotes && (
                                <div className="animate-in slide-in-from-top duration-300">
                                    <textarea
                                        ref={notesRef}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full h-48 p-3 border rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Take notes about this lesson..."
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={saveNotes}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                            startContent={
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            }
                                        >
                                            Save Notes
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Lesson Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    Lesson Resources
                                </h3>
                                <ul className="space-y-3">
                                    {lesson.resources.map((resource: Resource, index: number) => (
                                        <li key={index} className="group">
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white/50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 group"
                                            >
                                                <div className="mr-3 p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                                        {resource.name}
                                                    </span>
                                                </div>
                                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonContent;
