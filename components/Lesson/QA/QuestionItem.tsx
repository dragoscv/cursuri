// filepath: e:\GitHub\cursuri\components\Lesson\QA\QuestionItem.tsx
'use client';

import React, { useState, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { Answer, Question, Attachment } from '@/types';
import { LikeIcon, ReplyIcon, CheckIcon } from '@/components/icons/svg';
import { Chip, Avatar, Divider, Button } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import AnswersList from './AnswersList';
import AnswerForm from './AnswerForm';
import { updateDoc, doc, arrayUnion, arrayRemove, increment, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';

interface QuestionItemProps {
  question: Question;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question }) => {
  const t = useTranslations('lessons.qa');
  const [isReplying, setIsReplying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const context = useContext(AppContext);
  // Explicitly type the context to help TypeScript understand it's not undefined in our usage
  const user = context?.user || null;
  const isAdmin = context?.isAdmin || false;

  // Format the date for display
  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      date = date.toDate();
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const toggleLike = async () => {
    if (!user) return;

    try {
      const questionRef = doc(firestoreDB, 'questions', question.id);
      const isLiked = question.likedBy?.includes(user.uid);

      if (isLiked) {
        await updateDoc(questionRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(questionRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const toggleResolved = async () => {
    if (!user || (!isAdmin && user.uid !== question.userId)) return;

    try {
      const questionRef = doc(firestoreDB, 'questions', question.id);
      await updateDoc(questionRef, {
        isResolved: !question.isResolved,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating resolved status:', error);
    }
  };

  const handleSubmitAnswer = async (
    content: string,
    htmlContent: string,
    attachments?: Attachment[]
  ) => {
    if (!user || !content.trim()) return;

    try {
      const questionRef = doc(firestoreDB, 'questions', question.id);

      const newAnswer: Omit<Answer, 'id'> = {
        questionId: question.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userRole: isAdmin ? 'Instructor' : 'Student',
        userAvatar: user.photoURL || '',
        content: content.trim(),
        htmlContent: htmlContent,
        createdAt: Timestamp.now(),
        isAuthorOrAdmin: isAdmin || user.uid === question.userId,
        likes: 0,
        attachments,
      };

      // Generate a unique ID for the answer
      const answerId = crypto.randomUUID();

      await updateDoc(questionRef, {
        answers: arrayUnion({
          id: answerId,
          ...newAnswer,
        }),
      });

      setIsReplying(false);
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  };

  return (
    <div className="rounded-xl bg-[color:var(--ai-card-bg)]/80 shadow-sm border border-[color:var(--ai-card-border)]/30 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar
              src={question.userAvatar || '/default-avatar.png'}
              name={question.userName?.charAt(0) || '?'}
              size="sm"
              className="border-2 border-[color:var(--ai-primary)]/20"
            />
            <div>
              <h3 className="font-medium text-[color:var(--ai-text)]">{question.userName}</h3>
              <p className="text-xs text-[color:var(--ai-muted)]">
                {formatDate(question.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {question.isResolved && (
              <Chip
                color="success"
                variant="flat"
                className="text-xs"
                size="sm"
                startContent={<CheckIcon className="w-3.5 h-3.5" />}
              >
                {t('resolved')}
              </Chip>
            )}
          </div>
        </div>

        <h4 className="font-semibold mt-3 text-[color:var(--ai-text)]">{question.title}</h4>
        <p className="mt-2 text-[color:var(--ai-text-secondary)] whitespace-pre-wrap">
          {question.content}
        </p>

        <div className="flex items-center gap-4 mt-4">
          {' '}
          <Button
            size="sm"
            radius="lg"
            variant={question.likedBy?.includes(user?.uid || '') ? 'solid' : 'flat'}
            color="primary"
            onClick={toggleLike}
            startContent={<LikeIcon className="w-4 h-4" />}
            className={
              question.likedBy?.includes(user?.uid || '')
                ? 'text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20'
                : 'text-[color:var(--ai-muted)]'
            }
          >
            {question.likes || 0}
          </Button>
          <Button
            size="sm"
            radius="lg"
            variant="flat"
            onClick={() => setIsReplying(!isReplying)}
            startContent={<ReplyIcon className="w-4 h-4" />}
          >
            {t('reply')}
          </Button>{' '}
          {(isAdmin || user?.uid === question.userId) && (
            <Button
              size="sm"
              radius="lg"
              variant="flat"
              color={question.isResolved ? 'success' : 'default'}
              onClick={toggleResolved}
              startContent={<CheckIcon className="w-4 h-4" />}
              className={
                question.isResolved
                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                  : 'text-[color:var(--ai-muted)]'
              }
            >
              {question.isResolved ? t('resolved') : t('markAsResolved')}
            </Button>
          )}
        </div>
      </div>

      {isReplying && (
        <div className="px-4 py-3 bg-[color:var(--ai-card-bg)]/50 border-t border-[color:var(--ai-card-border)]/20">
          <AnswerForm onSubmit={handleSubmitAnswer} onCancel={() => setIsReplying(false)} />
        </div>
      )}

      {question.answers && question.answers.length > 0 && (
        <>
          <Divider className="my-0" />
          <div className="p-4 pt-2">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-medium text-[color:var(--ai-text)]">
                {question.answers.length}{' '}
                {question.answers.length === 1 ? t('answer') : t('answers')}
              </h5>
              <Button
                variant="light"
                size="sm"
                radius="lg"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[color:var(--ai-primary)]"
              >
                {expanded ? t('collapse') : t('viewAllAnswers')}
              </Button>
            </div>

            <AnswersList answers={question.answers} questionId={question.id} expanded={expanded} />
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionItem;
