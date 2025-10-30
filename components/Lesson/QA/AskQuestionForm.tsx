// filepath: e:\GitHub\cursuri\components\Lesson\QA\AskQuestionForm.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';
import RichTextEditor from './RichTextEditor';

interface AskQuestionFormProps {
  onSubmit: (title: string, content: string) => void;
  onCancel?: () => void;
}

const AskQuestionForm: React.FC<AskQuestionFormProps> = ({ onSubmit, onCancel }) => {
  const t = useTranslations('lessons.qa');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const handleEditorChange = (text: string, html: string) => {
    setContent(text);
    setHtmlContent(html);
  };

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = t('validationTitleRequired');
    } else if (title.trim().length < 5) {
      newErrors.title = t('validationTitleMinLength');
    } else if (title.trim().length > 150) {
      newErrors.title = t('validationTitleMaxLength');
    }

    if (!content.trim()) {
      newErrors.content = t('validationDetailsRequired');
    } else if (content.trim().length < 10) {
      newErrors.content = t('validationDetailsMinLength');
    } else if (content.trim().length > 2000) {
      newErrors.content = t('validationDetailsMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('[AskQuestionForm] Validation failed:', errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(title, content);
      setTitle('');
      setContent('');
      setErrors({});
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <Input
          type="text"
          label={t('questionTitle')}
          placeholder={t('questionTitlePlaceholder')}
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          className="w-full"
          isInvalid={!!errors.title}
          errorMessage={errors.title}
          description={t('questionTitleHelp')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
          {t('questionDetails')}
          <span className="ml-1 text-red-600">*</span>
        </label>
        <RichTextEditor
          value={content}
          onChange={handleEditorChange}
          placeholder={t('questionDetailsPlaceholder')}
          minHeight={200}
        />
        {errors.content && (
          <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
            {errors.content}
          </p>
        )}
        {!errors.content && (
          <p className="mt-1 text-xs text-[color:var(--ai-muted)]">{t('questionDetailsHelp')}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="flat"
          color="default"
          onClick={onCancel}
          type="button"
          className="bg-[color:var(--ai-card-border)]/20 hover:bg-[color:var(--ai-card-border)]/30 rounded-lg border border-[color:var(--ai-card-border)]/50 shadow-sm transition-all duration-300 hover:shadow"
        >
          {t('cancel')}
        </Button>
        <Button
          color="primary"
          type="submit"
          isLoading={isSubmitting}
          className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
        >
          {isSubmitting ? t('submitting') : t('submitQuestion')}
        </Button>
      </div>
    </form>
  );
};

export default AskQuestionForm;
