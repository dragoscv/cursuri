'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Textarea } from '@heroui/react';
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
    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
              <FiBookOpen className="mr-2 text-[color:var(--ai-primary)]" />
              <span>{t('title')}</span>
            </h3>
            <Button
              size="sm"
              variant="light"
              color="primary"
              onClick={onToggleNotes}
              className="text-[color:var(--ai-primary)]"
              endContent={
                <div
                  className={`transition-transform duration-200 ${showNotes ? 'rotate-180' : ''}`}
                >
                  <FiChevronDown size={16} />
                </div>
              }
            >
              {showNotes ? t('hide') : t('show')}
            </Button>
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
              classNames={{
                base: 'w-full',
                input: 'resize-none text-[color:var(--ai-foreground)] bg-transparent',
                inputWrapper:
                  'bg-[color:var(--ai-card-bg)]/80 border border-[color:var(--ai-card-border)] rounded-xl shadow-sm hover:border-[color:var(--ai-primary)]/50 focus-within:border-[color:var(--ai-primary)] transition-all',
              }}
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="md"
                color="primary"
                onClick={onSaveNotes}
                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-lg font-semibold"
                startContent={<FiCheck size={16} />}
              >
                {t('saveNotes')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Notes;
