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
              variant="bordered"
              className="w-full"
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="md"
                color="primary"
                onClick={onSaveNotes}
                className="bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] border-none hover:opacity-90 transition-opacity duration-200 rounded-full font-medium"
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
