// filepath: e:\GitHub\cursuri\components\Lesson\QA\QuestionsList.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Question } from '@/types';
import { Spinner, Divider, Input } from '@heroui/react';
import { Button } from '@/components/ui';
import QuestionItem from './QuestionItem';

interface QuestionsListProps {
  questions: Question[];
  lessonId: string;
  courseId: string;
  isLoading: boolean;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  lessonId,
  courseId,
  isLoading,
}) => {
  const t = useTranslations('lessons.qa');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'resolved') return matchesSearch && question.isResolved;
    if (filter === 'unresolved') return matchesSearch && !question.isResolved;

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          startContent={
            <svg
              className="w-4 h-4 text-[color:var(--ai-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          {' '}
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'flat'}
            onClick={() => setFilter('all')}
            radius="full"
            className={
              filter === 'all'
                ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                : 'text-[color:var(--ai-muted)]'
            }
          >
            {t('all')}
          </Button>
          <Button
            size="sm"
            variant={filter === 'resolved' ? 'success' : 'flat'}
            onClick={() => setFilter('resolved')}
            radius="full"
            className={
              filter === 'resolved'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'text-[color:var(--ai-muted)]'
            }
          >
            {t('resolved')}
          </Button>
          <Button
            size="sm"
            variant={filter === 'unresolved' ? 'warning' : 'flat'}
            onClick={() => setFilter('unresolved')}
            radius="full"
            className={
              filter === 'unresolved'
                ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                : 'text-[color:var(--ai-muted)]'
            }
          >
            {t('unresolved')}
          </Button>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--ai-card-bg)]/30 border border-dashed border-[color:var(--ai-card-border)]/50 rounded-xl">
          <svg
            className="w-10 h-10 text-[color:var(--ai-muted)]/60 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[color:var(--ai-muted)]">
            {searchQuery
              ? t('noQuestionsMatching')
              : filter === 'resolved'
                ? t('noResolvedQuestions')
                : filter === 'unresolved'
                  ? t('noUnresolvedQuestions')
                  : t('noQuestionsFound')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
