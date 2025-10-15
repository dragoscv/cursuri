'use client'

import { useState, useEffect, useCallback, useContext } from 'react';
import { Course, Lesson, AppContextProps } from '@/types';
import { AppContext } from '@/components/AppContext';
import {
  downloadLessonForOffline,
  getAllOfflineContent,
  deleteOfflineContent,
  getOfflineContent,
  OfflineContent,
  OfflineLessonContent,
  isOnline,
  formatSize
} from '@/utils/offline/offlineStorage';
import { toast } from '@heroui/react';
import { useToast } from '@/components/Toast';

interface UseOfflineContentReturn {
  offlineContent: OfflineContent[];
  isLoading: boolean;
  isDownloading: Record<string, boolean>; // Track download status by lesson ID
  downloadProgress: Record<string, number>; // Track download progress by lesson ID
  offlineSize: string; // Total size of all offline content in readable format
  downloadLesson: (lesson: Lesson, course: Course) => Promise<void>;
  removeOfflineContent: (id: string, type: 'lesson' | 'course') => Promise<void>;
  getOfflineLesson: (lessonId: string) => Promise<OfflineLessonContent | null>;
  isLessonAvailableOffline: (lessonId: string) => boolean;
  clearAllOfflineContent: () => Promise<void>;
}

/**
 * Hook for managing offline content downloads and storage
 */
export function useOfflineContent(): UseOfflineContentReturn {
  const { courses } = useContext(AppContext) as AppContextProps;
  const { showToast } = useToast();

  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Calculate total size of offline content
  const offlineSize = formatSize(
    offlineContent.reduce((total, content) => total + content.size, 0)
  );
  // Load all offline content on mount
  useEffect(() => {
    const loadOfflineContent = async () => {
      setIsLoading(true);
      try {
        const content = await getAllOfflineContent();
        setOfflineContent(content);
      } catch (error) {
        console.error('Error loading offline content:', error);
        showToast({
          type: 'error',
          message: 'Error loading offline content'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOfflineContent();

    // Listen for online/offline status changes
    const handleOnlineStatusChange = () => {
      // Refresh the list when coming back online
      if (isOnline()) {
        loadOfflineContent();
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [toast]);

  /**
   * Download a lesson for offline viewing
   */
  const downloadLesson = useCallback(async (lesson: Lesson, course: Course) => {
    // Don't allow downloads if already downloading this lesson
    if (isDownloading[lesson.id]) return;

    // Set download status for this lesson
    setIsDownloading(prev => ({ ...prev, [lesson.id]: true }));
    setDownloadProgress(prev => ({ ...prev, [lesson.id]: 0 }));
    try {      // Show toast notification
      showToast({
        type: 'info',
        message: `Starting download for "${lesson.name || lesson.title}"`
      });

      // Simulate progress updates (actual progress tracking would be more complex)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const currentProgress = prev[lesson.id] || 0;
          // Cap at 90% - the last 10% will be set after content is stored
          return { ...prev, [lesson.id]: Math.min(currentProgress + 10, 90) };
        });
      }, 500);

      // Download the lesson
      const offlineLesson = await downloadLessonForOffline(lesson, course);

      // Clear the progress interval
      clearInterval(progressInterval);

      // Set progress to 100%
      setDownloadProgress(prev => ({ ...prev, [lesson.id]: 100 }));

      // Update offline content list
      setOfflineContent(prev => {
        const existingIndex = prev.findIndex(
          content => content.id === lesson.id && content.type === 'lesson'
        );

        if (existingIndex >= 0) {
          // Replace existing content
          const updated = [...prev];
          updated[existingIndex] = offlineLesson;
          return updated;
        } else {
          // Add new content
          return [...prev, offlineLesson];
        }
      });      // Show success notification
      showToast({
        type: 'success',
        message: `Lesson "${lesson.name || lesson.title}" is now available offline`
      });
    } catch (error) {
      console.error('Error downloading lesson:', error);
      showToast({
        type: 'error',
        message: `Failed to download lesson "${lesson.name || lesson.title}"`
      });
    } finally {
      // Reset download status
      setIsDownloading(prev => ({ ...prev, [lesson.id]: false }));

      // Reset progress after a short delay (to show 100%)
      setTimeout(() => {
        setDownloadProgress(prev => ({ ...prev, [lesson.id]: 0 }));
      }, 2000);
    }
  }, [isDownloading, showToast]);

  /**
   * Remove offline content by ID and type
   */
  const removeOfflineContent = useCallback(async (id: string, type: 'lesson' | 'course') => {
    try {
      await deleteOfflineContent(id, type);
      // Update local state
      setOfflineContent(prev =>
        prev.filter(content => !(content.id === id && content.type === type))
      );

      showToast({
        type: 'success',
        message: 'Offline content has been removed'
      });
    } catch (error) {
      console.error('Error removing offline content:', error);
      showToast({
        type: 'error',
        message: 'Failed to remove offline content'
      });
    }
  }, [toast]);

  /**
   * Get an offline lesson by ID
   */
  const getOfflineLesson = useCallback(async (lessonId: string): Promise<OfflineLessonContent | null> => {
    try {
      const content = await getOfflineContent(lessonId, 'lesson') as OfflineLessonContent | null;
      return content;
    } catch (error) {
      console.error('Error getting offline lesson:', error);
      return null;
    }
  }, []);

  /**
   * Check if a lesson is available offline
   */
  const isLessonAvailableOffline = useCallback((lessonId: string): boolean => {
    return offlineContent.some(
      content => content.id === lessonId && content.type === 'lesson'
    );
  }, [offlineContent]);

  /**
   * Clear all offline content
   */
  const clearAllOfflineContent = useCallback(async (): Promise<void> => {
    try {
      // Delete each item one by one
      for (const content of offlineContent) {
        await deleteOfflineContent(content.id, content.type);
      }
      // Update local state
      setOfflineContent([]);

      showToast({
        type: 'success',
        message: 'All offline content has been removed'
      });
    } catch (error) {
      console.error('Error clearing offline content:', error);
      showToast({
        type: 'error',
        message: 'Failed to clear offline content'
      });
    }
  }, [offlineContent, showToast]);

  return {
    offlineContent,
    isLoading,
    isDownloading,
    downloadProgress,
    offlineSize,
    downloadLesson,
    removeOfflineContent,
    getOfflineLesson,
    isLessonAvailableOffline,
    clearAllOfflineContent
  };
}

export default useOfflineContent;
