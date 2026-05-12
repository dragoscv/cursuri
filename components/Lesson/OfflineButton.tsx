'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Tooltip, Progress } from '@heroui/react';
import { FiDownload, FiCheck, FiWifiOff } from '../icons/FeatherIcons';
import { useOfflineContent } from '@/components/Profile/hooks/useOfflineContent';
import { Lesson, Course } from '@/types';
import { AppContext } from '@/components/AppContext';
import { useTranslations } from 'next-intl';

interface OfflineButtonProps {
  lesson: Lesson;
  course: Course;
  className?: string;
}

export default function OfflineButton({ lesson, course, className = '' }: OfflineButtonProps) {
  const t = useTranslations('lessons.offlineButton');
  const {
    isDownloading,
    downloadProgress,
    downloadLesson,
    isLessonAvailableOffline,
    removeOfflineContent,
  } = useOfflineContent();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isAvailableOffline, setIsAvailableOffline] = useState<boolean>(false);

  // Track online status
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

  // Track offline availability
  useEffect(() => {
    setIsAvailableOffline(isLessonAvailableOffline(lesson.id));
  }, [lesson.id, isLessonAvailableOffline]);

  const handleDownload = async () => {
    if (isAvailableOffline) {
      // If already available offline, remove it
      await removeOfflineContent(lesson.id, 'lesson');
      setIsAvailableOffline(false);
    } else {
      // Otherwise download it
      await downloadLesson(lesson, course);
      setIsAvailableOffline(true);
    }
  };

  // Don't show the button if we're offline and the lesson isn't available
  if (!isOnline && !isAvailableOffline) {
    return null;
  }

  const isCurrentlyDownloading = isDownloading[lesson.id];
  const currentProgress = downloadProgress[lesson.id] || 0;

  return (
    <Tooltip content={isAvailableOffline ? t('removeFromStorage') : t('downloadForOffline')}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isCurrentlyDownloading || (!isOnline && !isAvailableOffline)}
        className={`relative cursor-pointer inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-xs font-medium border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isAvailableOffline
            ? 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
            : 'border-[color:var(--ai-foreground)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)] hover:text-[color:var(--ai-background)]'
        } ${className}`}
      >
        {isCurrentlyDownloading ? (
          <>
            <span className="opacity-0">{t('downloading')}</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Progress
                value={currentProgress}
                aria-label={t('downloadProgress')}
                className="h-1 w-full absolute bottom-0 left-0"
              />
              <span className="text-xs tabular-nums">{currentProgress}%</span>
            </div>
          </>
        ) : isAvailableOffline ? (
          <>
            <FiCheck className="w-4 h-4" aria-hidden />
            {t('availableOffline')}
          </>
        ) : (
          <>
            <FiDownload className="w-4 h-4" aria-hidden />
            {t('downloadLesson')}
          </>
        )}
      </button>
    </Tooltip>
  );
}
