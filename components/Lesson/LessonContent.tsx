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
import LessonAIContent from './LessonAIContent';
import OfflineButton from './OfflineButton';
import { sanitizeRich } from '@/utils/security/htmlSanitizer';
import { useOfflineContent } from '../Profile/hooks/useOfflineContent';
import { FiWifi, FiWifiOff, FiFileText, FiCheckCircle, FiBookOpen } from '@/components/icons/FeatherIcons';
import { logLessonCompletion, logVideoProgress, logCourseCompletion } from '@/utils/analytics';
import { incrementLessonCompletions, trackVideoWatchTime, incrementCourseCompletions, incrementUserCompletedCourses } from '@/utils/statistics';
import { GradientCard, ProgressRing } from '@/components/user-shell';

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
    if (!lessons || !courseId || !lessons[courseId]) {
      return 0;
    }

    const courseLessons = Object.values(lessons[courseId]);
    const totalLessons = courseLessons.length;
    if (totalLessons === 0) {
      return 0;
    }

    // Get the progress data for this course
    const courseProgress = lessonProgress?.[courseId] || {};

    // Count completed lessons from lessonProgress
    const completedCount = courseLessons.filter((lessonItem) => {
      const progress = courseProgress[lessonItem.id];
      const isComplete = progress?.isCompleted === true;

      return isComplete;
    }).length;

    const progressPercent = (completedCount / totalLessons) * 100;

    return progressPercent;
  }, [lessons, courseId, lessonProgress]);

  // If lesson is not available, show the loading component
  if (!lesson) {
    return loadingComponent;
  }

  // Get the list of lessons for the navigation component
  const navigationLessons = getCourseLessons();
  const completedLessonsCount = navigationLessons.filter((l) => l.isCompleted).length;
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      {/* Modern lesson hero */}
      <GradientCard className="mb-6 p-0 overflow-hidden" flush>
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--ai-primary) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--ai-secondary) 18%, transparent) 0%, transparent 55%)',
            }}
          />
          <div className="relative p-5 md:p-7">
            {course && (
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--ai-muted)] mb-3">
                <FiBookOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{course.name}</span>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                  {lesson.name}
                </h1>
                {lesson.description && (
                  <p className="text-[color:var(--ai-muted)] mt-3 max-w-2xl leading-relaxed">
                    {lesson.description}
                  </p>
                )}

                {/* Status chips */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {isCompleted && (
                    <Chip
                      color="success"
                      variant="flat"
                      size="sm"
                      startContent={<FiCheckCircle className="w-3.5 h-3.5" />}
                    >
                      {t('status.completed')}
                    </Chip>
                  )}
                  {!isOnline && (
                    <Chip
                      color="danger"
                      variant="flat"
                      size="sm"
                      startContent={<FiWifiOff className="w-3.5 h-3.5" />}
                    >
                      {t('status.offlineMode')}
                    </Chip>
                  )}
                  {progressSaved && (
                    <Chip color="primary" variant="flat" size="sm" className="animate-pulse">
                      {t('status.progressSaved')}
                    </Chip>
                  )}
                  {autoPlayNext && (
                    <Chip color="warning" variant="flat" size="sm">
                      {t('status.autoplayNext')}
                    </Chip>
                  )}
                  {course && <OfflineButton lesson={lesson} course={course} />}
                </div>
              </div>

              {/* Progress ring */}
              <div className="shrink-0 flex items-center gap-4 self-stretch md:self-start rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm p-4">
                <ProgressRing value={Math.round(progressPercentage)} size={84} strokeWidth={9} tone="primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--ai-muted)]">
                    {t('courseProgress')}
                  </p>
                  <p className="text-lg font-bold text-[color:var(--ai-foreground)]">
                    {completedLessonsCount}
                    <span className="text-sm text-[color:var(--ai-muted)] font-normal"> / {navigationLessons.length}</span>
                  </p>
                  <p className="text-xs text-[color:var(--ai-muted)]">lessons done</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GradientCard>
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
          {/* AI-generated audio + summary + transcript */}
          <LessonAIContent lesson={lesson} />
          {/* Lesson Content */}
          {(lesson.content) && (
            <Card
              className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl overflow-hidden 
                            transform transition-all duration-300 hover:shadow-2xl hover:border-[color:var(--ai-primary)]/30 rounded-lg"
            >
              <div className="p-4 sm:p-6">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 border-b border-[color:var(--ai-card-border)]">
                  <h3 className="font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                    <FiFileText className="text-[color:var(--ai-primary)]" size={20} />
                    <span className="text-base sm:text-lg">{t('sections.content')}</span>
                  </h3>
                </div>
                <div
                  className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-img:shadow-md prose-a:text-[color:var(--ai-primary)] text-[color:var(--ai-text-secondary)]"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRich(isUsingOfflineContent ? offlineLessonContent.content : lesson.content),
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
            onMarkComplete={async () => {
              await markLessonComplete(courseId, lesson.id);

              // Track lesson completion analytics
              logLessonCompletion(
                lesson.id,
                lesson.name || 'Unknown Lesson',
                courseId,
                typeof lesson.duration === 'number' ? lesson.duration : 0
              );

              // Increment completion count in database
              await incrementLessonCompletions(courseId, lesson.id);

              // Check if all lessons in course are completed
              const courseLessonsData = lessons?.[courseId];
              if (courseLessonsData) {
                const allLessons = Array.isArray(courseLessonsData)
                  ? courseLessonsData
                  : Object.values(courseLessonsData);
                const completedCount = Object.keys(lessonProgress?.[courseId] || {}).filter(
                  lid => lessonProgress?.[courseId]?.[lid]?.isCompleted
                ).length + 1; // +1 for the lesson just completed

                const completionPercentage = Math.round((completedCount / allLessons.length) * 100);

                // If course is 100% complete, log course completion
                if (completionPercentage >= 100 && course) {
                  logCourseCompletion(courseId, course.name || 'Unknown Course', 100);
                  await incrementCourseCompletions(courseId);

                  // Increment user's completed courses count
                  const userId = context.user?.uid;
                  if (userId) {
                    await incrementUserCompletedCourses(userId);
                  }
                }
              }
            }}
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
