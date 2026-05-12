'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiClock, FiCheck, FiLock } from '@/components/icons/FeatherIcons';
import { Lesson } from '@/types';
import { sanitizeRich } from '@/utils/security/htmlSanitizer';

interface LessonHeaderProps {
  lesson: Lesson;
  onBack: () => void;
  isCompleted: boolean;
  hasAccess: boolean;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ lesson, onBack, isCompleted, hasAccess }) => {
  const t = useTranslations('lessons.header');

  return (
    <div className="relative p-5 rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] mb-6 overflow-hidden">
      <div
        className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500"
        aria-hidden
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <Button
          variant="light"
          size="sm"
          onClick={onBack}
          className="p-0 min-w-0 text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] bg-transparent"
          startContent={<FiArrowLeft />}
        >
          <span className="text-sm">{t('backToCourse')}</span>
        </Button>

        <div className="flex items-center gap-2">
          {lesson.duration && (
            <div className="flex items-center text-[color:var(--ai-muted)]">
              <FiClock className="mr-1" size={14} />
              <span className="text-sm tabular-nums">{lesson.duration}</span>
            </div>
          )}

          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[10px] font-semibold uppercase tracking-[0.12em] border border-emerald-500/30 text-emerald-500">
              <FiCheck size={12} aria-hidden />
              {t('completed')}
            </span>
          ) : !hasAccess ? (
            <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[10px] font-semibold uppercase tracking-[0.12em] border border-rose-500/30 text-rose-500">
              <FiLock size={12} aria-hidden />
              {t('locked')}
            </span>
          ) : lesson.isFree ? (
            <span className="inline-flex items-center h-6 px-2 rounded-md text-[10px] font-semibold uppercase tracking-[0.12em] border border-amber-500/40 text-amber-500">
              {t('freePreview')}
            </span>
          ) : null}
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[color:var(--ai-foreground)] leading-[1.15]">
        {lesson.title || lesson.name}
      </h1>

      {lesson.description && (
        <div
          className="prose prose-sm prose-invert max-w-3xl text-[color:var(--ai-muted)] mt-2"
          dangerouslySetInnerHTML={{ __html: sanitizeRich(lesson.description) }}
        />
      )}
    </div>
  );
};

export default LessonHeader;
