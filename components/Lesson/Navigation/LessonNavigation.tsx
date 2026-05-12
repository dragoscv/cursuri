'use client';

import { Divider } from '@heroui/react';
import Button from '@/components/ui/Button';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiBookOpen,
  FiLayers,
  FiPlay,
  FiLock,
} from '@/components/icons/FeatherIcons';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface LessonItem {
  id: string;
  name: string;
  order?: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  durationMinutes?: number;
}

interface LessonNavigationProps {
  prevLessonId: string | null;
  nextLessonId: string | null;
  isCompleted: boolean;
  onNavigateLesson: (lessonId: string) => void;
  onClose?: () => void;
  lessons?: LessonItem[];
  currentLessonId?: string;
}

export default function LessonNavigation({
  prevLessonId,
  nextLessonId,
  isCompleted,
  onNavigateLesson,
  onClose,
  lessons = [],
  currentLessonId = '',
}: LessonNavigationProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('lessons');

  // Format duration in minutes to "XX:XX" format
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '00:00';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}${hrs > 0 ? '' : ' min'}`;
  };

  return (
    <div className="w-full">
      <div className="p-4 sm:p-6">
        <div className="bg-[color:var(--ai-card-bg)] py-3 px-4 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
          <h3 className="font-semibold text-[color:var(--ai-foreground)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-amber-500" size={18} aria-hidden />
              <span className="text-base sm:text-lg">{t('navigation.title')}</span>
            </div>
            {lessons && lessons.length > 0 && (
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                className="bg-[color:var(--ai-card-bg)]/50 hover:bg-amber-500/10 transition-colors"
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? 'Collapse lessons' : 'Expand lessons'}
              >
                <FiLayers size={18} />
              </Button>
            )}
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Navigation Buttons - All three on the same line */}
          <div className="flex flex-wrap gap-3">
            {/* Previous Lesson Button */}
            {prevLessonId && (
              <button
                type="button"
                onClick={() => onNavigateLesson(prevLessonId)}
                className="cursor-pointer flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-5 rounded-full text-sm font-medium border border-[color:var(--ai-foreground)] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-foreground)] hover:text-[color:var(--ai-background)] transition-colors duration-200"
              >
                <FiArrowLeft size={18} aria-hidden />
                {t('previousLesson')}
              </button>
            )}

            {/* Back to Course Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-5 rounded-full text-sm font-medium border border-[color:var(--ai-card-border)] text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-foreground)]/40 transition-colors duration-200"
              >
                <FiArrowLeft size={18} aria-hidden />
                {t('header.backToCourse')}
              </button>
            )}

            {/* Next Lesson Button */}
            {nextLessonId && (
              <button
                type="button"
                onClick={() => onNavigateLesson(nextLessonId)}
                className="cursor-pointer flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-5 rounded-full text-sm font-medium bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity duration-200"
              >
                {t('nextLesson')}
                <FiArrowRight size={18} aria-hidden />
              </button>
            )}
          </div>

          {/* Lesson List - Shows when expanded */}
          {expanded && lessons && lessons.length > 0 && (
            <div className="mt-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <Divider className="my-4" />
              <div className="font-semibold text-[color:var(--ai-foreground)] mb-4 flex items-center gap-2">
                <FiLayers className="text-amber-500" size={18} />
                <span className="text-sm sm:text-base">{t('courseProgress')}</span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`w-full p-3 sm:p-4 rounded-lg transition-all duration-200 flex items-center justify-between gap-3 group text-left
                                        ${
                                          lesson.isCurrent || lesson.id === currentLessonId
                                            ? 'bg-amber-500/10 ring-1 ring-amber-500/40'
                                            : 'hover:bg-[color:var(--ai-card-bg)]/80'
                                        }
                                        ${lesson.isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    onClick={() => !lesson.isLocked && onNavigateLesson(lesson.id)}
                    disabled={lesson.isLocked}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          lesson.isCompleted
                            ? 'bg-[color:var(--ai-success)]/20 text-[color:var(--ai-success)]'
                            : lesson.isLocked
                              ? 'bg-[color:var(--ai-muted)]/20 text-[color:var(--ai-muted)]'
                              : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {lesson.isCompleted ? (
                          <FiCheck size={16} />
                        ) : lesson.isLocked ? (
                          <FiLock size={16} />
                        ) : (
                          <FiPlay size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${lesson.isLocked ? 'text-[color:var(--ai-muted)]' : 'text-[color:var(--ai-foreground)]'}`}
                        >
                          {lesson.order && <span className="font-semibold">{lesson.order}. </span>}
                          {lesson.name}
                        </p>
                      </div>
                    </div>

                    {lesson.durationMinutes && (
                      <span className="text-xs text-[color:var(--ai-muted)] whitespace-nowrap flex-shrink-0">
                        {formatDuration(lesson.durationMinutes)}
                      </span>
                    )}
                  </button>
                ))}

                {lessons.length === 0 && (
                  <div className="p-6 text-center text-sm text-[color:var(--ai-muted)]">
                    {t('detail.lessonNotFound')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
