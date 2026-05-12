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
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer inline-flex items-center justify-center h-10 px-5 rounded-full text-sm font-medium border border-[color:var(--ai-card-border)] text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-foreground)]/40 transition-colors duration-200"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer inline-flex items-center justify-center h-10 px-5 rounded-full text-sm font-medium bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('submitting') : t('submitQuestion')}
        </button>
      </div>
    </form>
  );
};

export default AskQuestionForm;
