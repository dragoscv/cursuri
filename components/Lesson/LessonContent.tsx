'use client';

import React, { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '../AppContext';
import { Lesson, Course, AppContextProps, Resource, LessonSettingsProps, QAProps } from '@/types';
import { Card, Chip, Divider, Badge } from '@heroui/react';
import Button from '@/components/ui/Button';
import styles from './styles/LessonContent.module.css';
import VideoPlayer from './Video/VideoPlayer';
import LessonSettings from './Settings/LessonSettings';
import ResourcesList from './Resources/ResourcesList';
import Notes from './Notes/Notes';
import QASection from './QA/QASection';
import LessonNavigation from './Navigation/LessonNavigation';
import OfflineButton from './OfflineButton';
import { useOfflineContent } from '../Profile/hooks/useOfflineContent';
import { FiWifi, FiWifiOff } from '@/components/icons/FeatherIcons';

interface LessonContentProps {
  lesson: Lesson;
  course?: Course;
  prevLessonId?: string | null;
  nextLessonId?: string | null;
  onNavigateLesson?: (lessonId: string) => void;
  onClose?: () => void;
}

function LessonContent({
  lesson,
  course,
  prevLessonId = null,
  nextLessonId = null,
  onNavigateLesson,
  onClose,
}: LessonContentProps) {
  const t = useTranslations('lessons');
  const [isCompleted, setIsCompleted] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [saveProgress, setSaveProgress] = useState(true);
  const [progressSaved, setProgressSaved] = useState(false);
  const [videoPosition, setVideoPosition] = useState(0); // Track video position in seconds
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isUsingOfflineContent, setIsUsingOfflineContent] = useState(false);
  const [offlineLessonContent, setOfflineLessonContent] = useState<any>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>;

  const context = useContext(AppContext) as AppContextProps;
  if (!context) {
    throw new Error('AppContext is required');
  }

  const { lessons, lessonProgress, saveLessonProgress, markLessonComplete, courses } = context;
  const { getOfflineLesson, isLessonAvailableOffline } = useOfflineContent();

  // Debug: Log lessonProgress changes
  useEffect(() => {
    console.log('[LessonContent] lessonProgress changed:', {
      hasLessonProgress: !!lessonProgress,
      courseIds: lessonProgress ? Object.keys(lessonProgress) : [],
      fullProgress: lessonProgress,
      fullProgressStringified: JSON.stringify(lessonProgress, null, 2),
    });
  }, [lessonProgress]);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // If we're offline, try to load offline content
  useEffect(() => {
    const loadOfflineContent = async () => {
      if (!isOnline && lesson?.id) {
        if (isLessonAvailableOffline(lesson.id)) {
          const offlineContent = await getOfflineLesson(lesson.id);
          if (offlineContent) {
            setOfflineLessonContent(offlineContent);
            setIsUsingOfflineContent(true);
          }
        }
      } else {
        setIsUsingOfflineContent(false);
        setOfflineLessonContent(null);
      }
    };

    loadOfflineContent();
  }, [isOnline, lesson?.id, getOfflineLesson, isLessonAvailableOffline]);

  // Check if lesson is undefined before accessing properties
  // Use course.id first since lesson.courseId might not be set in Firestore
  const courseId = course?.id || lesson?.courseId || ''; // Set up loading state component for when lesson is not available
  const loadingComponent = (
    <div className="flex flex-col w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[color:var(--ai-card-border)]/50 shadow-xl">
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-32 h-32 bg-[color:var(--ai-card-border)]/30 rounded-full mb-4"></div>
            <div className="h-6 bg-[color:var(--ai-card-border)]/30 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-[color:var(--ai-card-border)]/30 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );

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
    if (lessonProgress && lessonProgress[courseId] && lessonProgress[courseId][lesson.id]) {
      const progress = lessonProgress[courseId][lesson.id];

      // Set completion status
      setIsCompleted(progress.isCompleted);
    }
  }, [courseId, lesson?.id, lessonProgress]);

  // Load saved notes from localStorage on component mount
  useEffect(() => {
    if (lesson?.id) {
      const savedNotes = localStorage.getItem(`notes-${lesson.id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [lesson?.id]);

  // Handle notes change
  const handleNotesChange = (value: string) => {
    setNotes(value);
  };

  // Toggle notes visibility
  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  // Save notes to localStorage
  const saveNotes = () => {
    if (lesson?.id) {
      localStorage.setItem(`notes-${lesson.id}`, notes);
      setProgressSaved(true);
      setTimeout(() => {
        setProgressSaved(false);
      }, 3000);
    }
  };

  // Get available lessons for the course for the navigation component
  const getCourseLessons = () => {
    if (!lessons || !courseId || !lessons[courseId]) return [];

    let courseLessons = [];
    if (Array.isArray(lessons[courseId])) {
      courseLessons = [...lessons[courseId]];
    } else {
      courseLessons = Object.values(lessons[courseId]);
    }

    // Sort lessons by order
    return courseLessons
      .sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      })
      .map((l) => ({
        id: l.id,
        name: l.name,
        order: l.order,
        isCompleted:
          lessonProgress &&
          lessonProgress[courseId] &&
          lessonProgress[courseId][l.id] &&
          lessonProgress[courseId][l.id].isCompleted,
        isCurrent: l.id === lesson.id,
        durationMinutes: l.durationMinutes || null,
        isLocked: l.isLocked || false,
      }));
  };

  // Calculate progress percentage for the progress bar based on completed lessons
  // Using useMemo to recalculate when dependencies change
  const progressPercentage = useMemo(() => {
    console.log('[LessonContent] useMemo triggered', {
      hasLessons: !!lessons,
      courseId,
      hasLessonProgress: !!lessonProgress,
      lessonProgressKeys: lessonProgress ? Object.keys(lessonProgress) : [],
    });

    if (!lessons || !courseId || !lessons[courseId]) {
      console.log('[LessonContent] calculateProgress: Missing data', {
        hasLessons: !!lessons,
        courseId,
        hasCourseInLessons: lessons ? !!lessons[courseId] : false,
      });
      return 0;
    }

    const courseLessons = Object.values(lessons[courseId]);
    const totalLessons = courseLessons.length;
    if (totalLessons === 0) {
      console.log('[LessonContent] calculateProgress: No lessons found');
      return 0;
    }

    // Get the progress data for this course
    const courseProgress = lessonProgress?.[courseId] || {};
    console.log('[LessonContent] Course progress data:', {
      courseId,
      progressKeys: Object.keys(courseProgress),
      progressData: courseProgress,
    });

    // Count completed lessons from lessonProgress
    const completedCount = courseLessons.filter((lessonItem) => {
      const progress = courseProgress[lessonItem.id];
      const isComplete = progress?.isCompleted === true;

      console.log(`[LessonContent] Lesson ${lessonItem.id} (${lessonItem.name}):`, {
        hasProgress: !!progress,
        isCompleted: progress?.isCompleted,
        isComplete,
      });

      return isComplete;
    }).length;

    const progressPercent = (completedCount / totalLessons) * 100;

    console.log('[LessonContent] calculateProgress FINAL:', {
      courseId,
      totalLessons,
      completedCount,
      progressPercent: Math.round(progressPercent),
      lessonProgressExists: !!lessonProgress?.[courseId],
      completedLessonIds: courseLessons
        .filter((l) => courseProgress[l.id]?.isCompleted === true)
        .map((l) => l.id),
    });

    return progressPercent;
  }, [lessons, courseId, lessonProgress]);

  // If lesson is not available, show the loading component
  if (!lesson) {
    return loadingComponent;
  }

  // Get the list of lessons for the navigation component
  const navigationLessons = getCourseLessons();
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[color:var(--ai-card-border)]/50 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">
              {lesson.name}
            </h1>
            {lesson.description && (
              <p className="text-[color:var(--ai-muted)] max-w-2xl">{lesson.description}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {' '}
            {/* Offline status indicator */}
            {!isOnline && (
              <Badge color="danger" variant="flat" className="mb-1 flex items-center gap-1">
                <FiWifiOff size={12} />
                {t('status.offlineMode')}
              </Badge>
            )}
            {/* Download for offline button */}
            {course && <OfflineButton lesson={lesson} course={course} className="mb-2" />}
            {/* Course Progress Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-[color:var(--ai-muted)]">{t('courseProgress')}</span>
              <span className="font-semibold text-[color:var(--ai-primary)]">
                {Math.round(progressPercentage)}%
              </span>
            </div>{' '}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
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
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              }
            >
              {t('status.completed')}
            </Chip>
          )}

          {progressSaved && (
            <Chip
              color="primary"
              variant="flat"
              className="animate-pulse"
              startContent={
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              }
            >
              {t('status.progressSaved')}
            </Chip>
          )}

          {autoPlayNext && (
            <Chip
              color="warning"
              variant="flat"
              startContent={
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              }
            >
              {t('status.autoplayNext')}
            </Chip>
          )}
        </div>
      </div>{' '}
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-1">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {' '}
          {/* Video Player Component */}
          <VideoPlayer
            lesson={
              isUsingOfflineContent
                ? {
                  ...lesson,
                  videoUrl: offlineLessonContent?.videoUrl || lesson.videoUrl,
                  thumbnailUrl:
                    offlineLessonContent?.thumbnailUrl || lesson.thumbnailUrl || lesson.thumbnail,
                }
                : lesson
            }
            isCompleted={isCompleted}
            saveProgress={saveProgress}
            saveLessonProgress={saveLessonProgress}
            markLessonComplete={markLessonComplete}
            setIsCompleted={setIsCompleted}
            setProgressSaved={setProgressSaved}
            isOfflineMode={isUsingOfflineContent}
          />
          {/* Lesson Navigation - Positioned directly below video player */}
          {(prevLessonId || nextLessonId || onClose) && (
            <Card
              className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl overflow-hidden 
                            transform transition-all duration-300 hover:shadow-2xl hover:border-[color:var(--ai-primary)]/30 rounded-lg"
            >
              <LessonNavigation
                prevLessonId={prevLessonId}
                nextLessonId={nextLessonId}
                isCompleted={isCompleted}
                onNavigateLesson={(lessonId) => onNavigateLesson && onNavigateLesson(lessonId)}
                onClose={onClose}
                lessons={navigationLessons}
                currentLessonId={lesson.id}
              />
            </Card>
          )}
          {/* Lesson Content */}
          {(lesson.content || (isUsingOfflineContent && offlineLessonContent?.content)) && (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                  {t('sections.content')}
                </h2>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: isUsingOfflineContent ? offlineLessonContent.content : lesson.content,
                  }}
                />
              </div>
            </Card>
          )}
          {/* Quiz Section (if lesson has a quiz) */}
          {lesson.hasQuiz && (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                  {t('sections.knowledgeCheck')}
                </h2>
                <p className="text-[color:var(--ai-muted)] mb-4">
                  {t('knowledgeCheck.description')}
                </p>
                <Button
                  color="primary"
                  className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium"
                  endContent={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  }
                >
                  {t('knowledgeCheck.startButton')}
                </Button>
              </div>
            </Card>
          )}
          {/* Q&A Discussion Section */}
          <QASection courseId={courseId} lessonId={lesson.id} />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Lesson Settings Component */}
          <LessonSettings
            isCompleted={isCompleted}
            autoPlayNext={autoPlayNext}
            saveProgress={saveProgress}
            onMarkComplete={() => markLessonComplete(courseId, lesson.id)}
            onAutoPlayToggle={setAutoPlayNext}
            onSaveProgressToggle={setSaveProgress}
            onManualSave={() => saveLessonProgress(courseId, lesson.id, videoPosition, isCompleted)}
          />
          {/* Notes Component */}
          <Notes
            notes={notes}
            showNotes={showNotes}
            onNotesChange={handleNotesChange}
            onToggleNotes={toggleNotes}
            onSaveNotes={saveNotes}
            notesRef={notesRef}
          />{' '}
          {/* Resources Component */}
          {((lesson.resources && lesson.resources.length > 0) ||
            (isUsingOfflineContent &&
              offlineLessonContent?.resources &&
              offlineLessonContent.resources.length > 0)) && (
              <ResourcesList
                resources={
                  isUsingOfflineContent && offlineLessonContent?.resources
                    ? offlineLessonContent.resources.map((r: any) => ({
                      url: r.data,
                      name: r.name,
                      type: r.type,
                    }))
                    : lesson.resources || []
                }
                isOfflineMode={isUsingOfflineContent}
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default LessonContent;
