'use client'

import React, { useState, useEffect, useContext } from 'react';
import { Question, Lesson } from '@/types';
import { Card, Button, Spinner } from '@heroui/react';
import AskQuestionForm from './AskQuestionForm';
import QuestionsList from './QuestionsList';
import { AppContext } from '@/components/AppContext';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';

interface QASectionProps {
    lesson: Lesson;
}

const QASection: React.FC<QASectionProps> = ({ lesson }) => {
    const [isAskingQuestion, setIsAskingQuestion] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const context = useContext(AppContext);
    const { user, isAdmin } = context;

    useEffect(() => {
        if (lesson.id) {
            fetchQuestions();
        }
    }, [lesson.id]);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const questionsRef = collection(firestoreDB, 'questions');
            const q = query(
                questionsRef,
                where('lessonId', '==', lesson.id),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const fetchedQuestions: Question[] = [];

            querySnapshot.forEach((doc) => {
                fetchedQuestions.push({
                    id: doc.id,
                    ...doc.data()
                } as Question);
            });

            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitQuestion = async (title: string, content: string) => {
        if (!user) return;

        try {
            const newQuestion = {
                lessonId: lesson.id,
                courseId: lesson.courseId,
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userRole: isAdmin ? 'Instructor' : 'Student',
                userAvatar: user.photoURL || '',
                title,
                content,
                createdAt: Timestamp.now(),
                isResolved: false,
                answers: [],
                likes: 0,
                likedBy: []
            };

            await addDoc(collection(firestoreDB, 'questions'), newQuestion);
            await fetchQuestions();
            setIsAskingQuestion(false);
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    if (!user) {
        return (
            <Card className="mt-8 border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                        Questions & Answers
                    </h2>
                    <p className="text-[color:var(--ai-muted)]">
                        Please sign in to view questions or ask your own.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mt-8 border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                        Questions & Answers
                    </h2>
                    {!isAskingQuestion && (
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
                            onClick={() => setIsAskingQuestion(true)}
                        >
                            Ask a Question
                        </Button>
                    )}
                </div>

                {isAskingQuestion ? (
                    <AskQuestionForm
                        onSubmit={handleSubmitQuestion}
                        onCancel={() => setIsAskingQuestion(false)}
                    />
                ) : (
                    <QuestionsList
                        questions={questions}
                        lessonId={lesson.id}
                        courseId={lesson.courseId || ''}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </Card>
    );
};

export default QASection;