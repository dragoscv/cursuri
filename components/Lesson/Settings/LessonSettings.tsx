'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Divider, Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCheck, FiSave, FiPlayCircle, FiClock } from '@/components/icons/FeatherIcons';

interface LessonSettingsProps {
  isCompleted: boolean;
  autoPlayNext: boolean;
  saveProgress: boolean;
  onMarkComplete: () => void;
  onAutoPlayToggle: (value: boolean) => void;
  onSaveProgressToggle: (value: boolean) => void;
  onManualSave: () => void;
}

const LessonSettings: React.FC<LessonSettingsProps> = ({
  isCompleted,
  autoPlayNext,
  saveProgress,
  onMarkComplete,
  onAutoPlayToggle,
  onSaveProgressToggle,
  onManualSave,
}) => {
  const t = useTranslations('lessons.settings');

  return (
    <div className="rounded-2xl overflow-hidden border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]">
      <div className="bg-[color:var(--ai-card-bg)] py-4 px-5 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
        <h3 className="font-semibold text-[color:var(--ai-foreground)] flex items-center">
          <FiClock className="mr-2 text-amber-500" size={18} aria-hidden />
          <span>{t('title')}</span>
        </h3>
      </div>

      <div className="p-5 bg-[color:var(--ai-card-bg)] space-y-5">
        {/* Mark as Complete/Incomplete Button */}
        <button
          type="button"
          onClick={onMarkComplete}
          className="cursor-pointer inline-flex items-center justify-center gap-2 w-full h-12 sm:h-14 rounded-full text-sm font-medium bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity duration-200"
        >
          <FiCheck size={18} aria-hidden />
          {isCompleted ? t('markAsIncomplete') : t('markAsComplete')}
        </button>

        <Divider className="opacity-50" />

        {/* Auto-play Toggle */}
        <div className="flex items-center justify-between p-2 bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/30 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[color:var(--ai-foreground)]">
              {t('autoPlayNext')}
            </span>
            <span className="text-xs text-[color:var(--ai-muted)]">{t('autoPlayNextDesc')}</span>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={() => onAutoPlayToggle(!autoPlayNext)}
                className="sr-only peer"
                title="Auto-play Next Lesson"
              />
              <div className="w-11 h-6 bg-[color:var(--ai-card-border)]/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[color:var(--ai-card-bg)] dark:after:border-[color:var(--ai-background)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[color:var(--ai-card-bg)] dark:after:bg-[color:var(--ai-foreground)] after:border-[color:var(--ai-card-border)]/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)] shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Save Progress Toggle */}
        <div className="flex items-center justify-between p-2 bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/30 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[color:var(--ai-foreground)]">
              {t('autoSaveProgress')}
            </span>
            <span className="text-xs text-[color:var(--ai-muted)]">
              {t('autoSaveProgressDesc')}
            </span>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={saveProgress}
                onChange={() => onSaveProgressToggle(!saveProgress)}
                className="sr-only peer"
                title="Auto-save Progress"
              />
              <div className="w-11 h-6 bg-[color:var(--ai-card-border)]/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--ai-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[color:var(--ai-card-bg)] dark:after:border-[color:var(--ai-background)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[color:var(--ai-card-bg)] dark:after:bg-[color:var(--ai-foreground)] after:border-[color:var(--ai-card-border)]/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--ai-primary)] shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Manual Save Button (if auto-save is off) */}
        {!saveProgress && (
          <Button
            variant="flat"
            size="sm"
            className="w-full bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)]/50 shadow-sm transition-all duration-300 hover:shadow"
            onClick={onManualSave}
            startContent={<FiSave size={16} />}
          >
            {t('saveProgressManually')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonSettings;
