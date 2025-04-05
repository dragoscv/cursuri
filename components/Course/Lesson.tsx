'use client'

import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { Card } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { AppContext } from '@/components/AppContext'
import { AppContextProps, Lesson as LessonType } from '@/types'

// Import our modular components
import VideoPlayer from '@/components/Lesson/Video/VideoPlayer'
import LessonHeader from '@/components/Lesson/LessonHeader'
import LessonNavigation from '@/components/Lesson/Navigation/LessonNavigation'
import LessonSettings from '@/components/Lesson/Settings/LessonSettings'
import Notes from '@/components/Lesson/Notes/Notes'
import ResourcesList from '@/components/Lesson/Resources/ResourcesList'

interface LessonProps {
    lesson: LessonType;
    onClose: () => void;
}

export default function Lesson({ lesson, onClose }: LessonProps) {
    const [videoProgress, setVideoProgress] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [notes, setNotes] = useState('')
    const [nextLessonId, setNextLessonId] = useState<string | null>(null)
    const [prevLessonId, setPrevLessonId] = useState<string | null>(null)
    const [isCompleted, setIsCompleted] = useState(false)
    const [autoPlayNext, setAutoPlayNext] = useState(false)
    const [saveProgress, setSaveProgress] = useState(true)
    const [progressSaved, setProgressSaved] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const notesRef = useRef<HTMLTextAreaElement>(null)
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

    const router = useRouter()

    const context = useContext(AppContext) as AppContextProps
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }

    const { lessons, lessonProgress, saveLessonProgress, markLessonComplete } = context
    const courseId = lesson.courseId || ''

    // Find previous and next lessons for navigation
    useEffect(() => {
        if (courseId && lessons[courseId]) {
            const courseLessons = Object.values(lessons[courseId])
                .sort((a: LessonType, b: LessonType) => {
                    const orderA = a.order || 0
                    const orderB = b.order || 0
                    return orderA - orderB
                })

            const currentIndex = courseLessons.findIndex((l: LessonType) => l.id === lesson.id)

            if (currentIndex > 0) {
                setPrevLessonId(courseLessons[currentIndex - 1].id)
            } else {
                setPrevLessonId(null)
            }

            if (currentIndex < courseLessons.length - 1) {
                setNextLessonId(courseLessons[currentIndex + 1].id)
            } else {
                setNextLessonId(null)
            }
        }
    }, [lesson.id, courseId, lessons])

    // Load saved progress and completion status
    useEffect(() => {
        // Load auto-play preference from localStorage
        const savedAutoPlay = localStorage.getItem('autoPlayNext')
        if (savedAutoPlay !== null) {
            setAutoPlayNext(savedAutoPlay === 'true')
        }

        // Load save progress preference from localStorage
        const savedProgressPref = localStorage.getItem('saveProgress')
        if (savedProgressPref !== null) {
            setSaveProgress(savedProgressPref === 'true')
        }

        // Check if we have progress data for this lesson
        if (lessonProgress &&
            lessonProgress[courseId] &&
            lessonProgress[courseId][lesson.id]) {

            const progress = lessonProgress[courseId][lesson.id]

            // Set completion status
            setIsCompleted(progress.isCompleted)

            // If not completed and we have a saved position, set it
            if (!progress.isCompleted && progress.lastPosition > 0 && videoRef.current) {
                // Only resume if we're more than 5 seconds into the video and not at the end
                if (progress.lastPosition > 5 &&
                    (videoRef.current.duration - progress.lastPosition) > 3) {
                    videoRef.current.currentTime = progress.lastPosition
                    setProgressSaved(true)

                    // Show the saved progress notification
                    setTimeout(() => {
                        setProgressSaved(false)
                    }, 3000)
                }
            }
        }
    }, [courseId, lesson.id, lessonProgress])

    // Save progress when component unmounts or video is paused
    const saveCurrentProgress = useCallback(() => {
        if (!videoRef.current || !saveProgress) return

        const currentTime = videoRef.current.currentTime
        const duration = videoRef.current.duration

        // Don't save if we're at the beginning or very end
        if (currentTime < 3 || (duration - currentTime) < 3) return

        saveLessonProgress(courseId, lesson.id, currentTime, isCompleted)
        setProgressSaved(true)

        // Show a temporary notification that progress was saved
        setTimeout(() => {
            setProgressSaved(false)
        }, 3000)
    }, [courseId, lesson.id, saveLessonProgress, isCompleted, saveProgress])

    // Handle video time update
    const handleTimeUpdate = (progress: number) => {
        setVideoProgress(progress)

        // Auto-save progress every 15 seconds
        if (progressSaveTimerRef.current === null && saveProgress && isPlaying) {
            progressSaveTimerRef.current = setTimeout(() => {
                saveCurrentProgress()
                progressSaveTimerRef.current = null
            }, 15000) // Save every 15 seconds
        }
    }

    // Check if video ended, and if auto-play is on, go to next lesson
    const handleVideoEnded = () => {
        // Mark the lesson as completed when the video ends
        handleMarkComplete()

        // If autoplay is enabled and there's a next lesson, navigate to it
        if (autoPlayNext && nextLessonId) {
            setTimeout(() => {
                navigateToLesson(nextLessonId)
            }, 1500) // Small delay before auto-advancing
        }
    }

    // Handle manually marking a lesson as complete
    const handleMarkComplete = useCallback(() => {
        markLessonComplete(courseId, lesson.id)
        setIsCompleted(true)
    }, [courseId, lesson.id, markLessonComplete])

    // Handle toggling autoplay preference
    const handleAutoPlayToggle = () => {
        const newValue = !autoPlayNext
        setAutoPlayNext(newValue)
        localStorage.setItem('autoPlayNext', newValue.toString())
    }

    // Handle toggling save progress preference
    const handleSaveProgressToggle = () => {
        const newValue = !saveProgress
        setSaveProgress(newValue)
        localStorage.setItem('saveProgress', newValue.toString())
    }

    // Load notes from localStorage
    useEffect(() => {
        const savedNotes = localStorage.getItem(`lesson-notes-${lesson.id}`)
        if (savedNotes) {
            setNotes(savedNotes)
        }
    }, [lesson.id])

    // Save notes to localStorage
    const saveNotes = () => {
        if (notes.trim()) {
            localStorage.setItem(`lesson-notes-${lesson.id}`, notes)
            // Show saved notification briefly
            setProgressSaved(true)
            setTimeout(() => {
                setProgressSaved(false)
            }, 2000)
        }
    }

    // Save progress when the component unmounts
    useEffect(() => {
        return () => {
            // Clear any active timers
            if (progressSaveTimerRef.current) {
                clearTimeout(progressSaveTimerRef.current)
                progressSaveTimerRef.current = null
            }

            // Save current progress
            saveCurrentProgress()
        }
    }, [saveCurrentProgress])

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip keyboard shortcuts if user is typing in notes
            if (notesRef.current?.contains(document.activeElement)) return;

            // Space for play/pause
            if (e.code === 'Space') {
                e.preventDefault()
                if (videoRef.current) {
                    if (videoRef.current.paused) {
                        videoRef.current.play()
                    } else {
                        videoRef.current.pause()
                    }
                }
            }

            // M key for mute/unmute
            if (e.code === 'KeyM') {
                e.preventDefault()
                if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const navigateToLesson = (lessonId: string) => {
        if (courseId && lessonId) {
            // Save progress before navigating
            saveCurrentProgress()
            router.push(`/courses/${courseId}/lessons/${lessonId}`)
        }
    }

    // Calculate progress percentage for the progress bar
    const calculateProgress = () => {
        if (!lessons[courseId]) return 0;

        const totalLessons = Object.keys(lessons[courseId]).length;
        if (totalLessons === 0) return 0;

        // Find current lesson index
        const sortedLessons = Object.values(lessons[courseId])
            .sort((a: LessonType, b: LessonType) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });

        const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
        return ((currentIndex + 1) / totalLessons) * 100;
    }

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">
            {/* Lesson Header */}
            <LessonHeader
                lesson={lesson}
                isCompleted={isCompleted}
                progressSaved={progressSaved}
                autoPlayNext={autoPlayNext}
                calculateProgress={calculateProgress}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Video Player */}
                    <VideoPlayer
                        lesson={lesson}
                        isCompleted={isCompleted}
                        onTimeUpdate={handleTimeUpdate}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={handleVideoEnded}
                        onMarkComplete={handleMarkComplete}
                        saveCurrentProgress={saveCurrentProgress}
                        videoRef={videoRef}
                        videoContainerRef={videoContainerRef}
                    />

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
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                        <Notes
                            notes={notes}
                            onNotesChange={setNotes}
                            onSaveNotes={saveNotes}
                            notesRef={notesRef}
                        />
                    </Card>

                    {/* Lesson Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                            <ResourcesList resources={lesson.resources} />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}