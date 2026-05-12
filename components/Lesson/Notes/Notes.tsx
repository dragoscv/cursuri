'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { FiBookOpen, FiCheck, FiChevronDown } from '@/components/icons/FeatherIcons';

interface NotesProps {
  notes: string;
  showNotes: boolean;
  onNotesChange: (notes: string) => void;
  onToggleNotes: () => void;
  onSaveNotes: () => void;
  notesRef: React.RefObject<HTMLTextAreaElement>;
}

export const Notes: React.FC<NotesProps> = ({
  notes,
  showNotes,
  onNotesChange,
  onToggleNotes,
  onSaveNotes,
  notesRef,
}) => {
  const t = useTranslations('lessons.notesSection');

  return (
    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] shadow-none rounded-2xl overflow-hidden transition-colors duration-200 hover:border-[color:var(--ai-foreground)]/40">
      <div className="p-5">
        <div className="bg-[color:var(--ai-card-bg)] py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
              <FiBookOpen className="mr-2 text-amber-500" aria-hidden />
              <span>{t('title')}</span>
            </h3>
            <button
              type="button"
              onClick={onToggleNotes}
              className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] transition-colors duration-200"
            >
              {showNotes ? t('hide') : t('show')}
              <FiChevronDown
                size={14}
                aria-hidden
                className={`transition-transform duration-200 ${showNotes ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {showNotes && (
          <div className="animate-in slide-in-from-top duration-300">
            <Textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              minRows={6}
              placeholder={t('notePlaceholder')}
              variant="bordered"
              className="w-full"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onSaveNotes}
                className="cursor-pointer inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity duration-200"
              >
                <FiCheck size={16} aria-hidden />
                {t('saveNotes')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Notes;
