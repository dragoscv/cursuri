import React from 'react';
import { Card, Textarea } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiEdit3 } from '@/components/icons/FeatherIcons/FiEdit3';
import { FiSave } from '@/components/icons/FeatherIcons/FiSave';
import { useTranslations } from 'next-intl';

interface LessonNotesProps {
  notes: string;
  onChange: (notes: string) => void;
  onSave: () => void;
}

const LessonNotes: React.FC<LessonNotesProps> = ({ notes, onChange, onSave }) => {
  const t = useTranslations('courses.lessonNotes');

  return (
    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] shadow-none rounded-2xl overflow-hidden transition-colors duration-200 hover:border-[color:var(--ai-foreground)]/40">
      <div className="p-5">
        <div className="bg-[color:var(--ai-card-bg)] py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
          <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
            <FiEdit3 className="mr-2 text-[color:var(--ai-primary)]" />
            <span>{t('title')}</span>
          </h3>
        </div>

        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 text-[color:var(--ai-foreground)] placeholder:text-[color:var(--ai-muted)]/70 min-h-[120px]"
          />

          <Button
            onClick={onSave}
            variant="flat"
            className="bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)] transition-all duration-200"
            startContent={<FiSave size={16} />}
          >
            {t('saveButton')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LessonNotes;
