'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { useOfflineContent } from './hooks/useOfflineContent';
import { Card, Button, Badge } from '@heroui/react';
import {
  FiDownload,
  FiTrash2,
  FiWifi,
  FiWifiOff,
  FiHardDrive,
  FiClock,
} from '@/components/icons/FeatherIcons';
import { useRouter } from 'next/navigation';
import { AppContextProps } from '@/types';

export default function OfflineContentSection() {
  const t = useTranslations('profile.offline');
  const { courses } = useContext(AppContext) as AppContextProps;
  const { offlineContent, isLoading, offlineSize, removeOfflineContent, clearAllOfflineContent } =
    useOfflineContent();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const router = useRouter();

  // Filter to just show lessons for now
  const offlineLessons = offlineContent.filter((content) => content.type === 'lesson');

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

  // Navigate to lesson - ensuring the courseId field exists
  const openLesson = (content: { id: string; type: string; courseId?: string }) => {
    if (content.type === 'lesson' && content.courseId) {
      router.push(`/courses/${content.courseId}/lessons/${content.id}`);
    }
  };

  // Format the date in a readable way
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Check if content has expired
  const isExpired = (expiryDate: number) => {
    return expiryDate < Date.now();
  };

  return (
    <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
        <div className="p-5">
          <div className="bg-gradient-to-r from-[color:var(--ai-secondary)]/10 via-[color:var(--ai-secondary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                <FiHardDrive className="mr-2 text-[color:var(--ai-secondary)]" />
                <span>{t('title')}</span>
              </h3>
              <Badge
                color={isOnline ? 'success' : 'danger'}
                variant="flat"
                className="flex items-center gap-1"
              >
                {isOnline ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
                {isOnline ? t('online') : t('offline')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-[color:var(--ai-muted)]">{t('storageUsed')}</span>
              <p className="font-medium text-[color:var(--ai-foreground)]">{offlineSize}</p>
            </div>

            {offlineLessons.length > 0 && (
              <Button color="danger" variant="flat" onClick={() => setShowConfirmClear(true)}>
                <FiTrash2 className="w-4 h-4 mr-2" />
                {t('clearAll')}
              </Button>
            )}

            {showConfirmClear && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-[color:var(--ai-card-bg)] p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-lg font-medium mb-2">Clear offline content</h3>
                  <p className="text-[color:var(--ai-muted)] mb-4">
                    Are you sure you want to delete all offline content? This will remove all
                    downloaded lessons and you'll need an internet connection to access them again.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      color="default"
                      variant="bordered"
                      onClick={() => setShowConfirmClear(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      onClick={() => {
                        clearAllOfflineContent();
                        setShowConfirmClear(false);
                      }}
                    >
                      Clear All Content
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-[color:var(--ai-primary)]/30 border-t-[color:var(--ai-primary)] rounded-full animate-spin mb-4"></div>
              <p className="text-[color:var(--ai-muted)]">Loading offline content...</p>
            </div>
          ) : offlineLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[color:var(--ai-secondary)]/10 flex items-center justify-center mb-4">
                <FiDownload className="w-8 h-8 text-[color:var(--ai-secondary)]" />
              </div>
              <h4 className="text-lg font-medium mb-2">No offline content yet</h4>
              <p className="text-[color:var(--ai-muted)] max-w-md">
                Download lessons to view them offline. Look for the download button when viewing a
                lesson.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {offlineLessons.map((content: any) => {
                const contentExpired = isExpired(content.expiryDate);

                return (
                  <div
                    key={`${content.type}-${content.id}`}
                    className={`
                      flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-lg border 
                      ${
                        contentExpired
                          ? 'border-[color:var(--ai-destructive)]/30 bg-[color:var(--ai-destructive)]/5'
                          : 'border-[color:var(--ai-card-border)]/50 bg-[color:var(--ai-card-bg)]/60'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium truncate cursor-pointer ${contentExpired ? 'text-[color:var(--ai-destructive)]' : 'text-[color:var(--ai-foreground)]'}`}
                          onClick={() => !contentExpired && openLesson(content)}
                        >
                          {content.title}
                        </h4>
                        {contentExpired && (
                          <Badge color="danger" variant="flat" className="whitespace-nowrap">
                            Expired
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--ai-muted)]">
                        <span className="flex items-center">
                          <FiClock size={12} className="mr-1" />
                          Downloaded: {formatDate(content.downloadDate)}
                        </span>

                        {!contentExpired && (
                          <span className="flex items-center">
                            <FiClock size={12} className="mr-1" />
                            Expires: {formatDate(content.expiryDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2">
                      {!contentExpired && (
                        <Button
                          color="primary"
                          variant="bordered"
                          size="sm"
                          onClick={() => openLesson(content)}
                        >
                          View
                        </Button>
                      )}

                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onClick={() => removeOfflineContent(content.id, content.type)}
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
