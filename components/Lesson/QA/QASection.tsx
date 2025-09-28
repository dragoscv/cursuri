'use client'

import React, { useState, useEffect, useContext } from 'react';
import { Card, Spinner } from '@heroui/react';
import { FiMessageSquare } from '@/components/icons/FeatherIcons';
import { AppContext } from '@/components/AppContext';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { Question, QAProps } from '@/types';
import QuestionsList from './QuestionsList';
import AskQuestionForm from './AskQuestionForm';

function QASection({ lessonId, courseId }: QAProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const context = useContext(AppContext);
    const user = context?.user;
    const isAdmin = context?.isAdmin || false;

    // Fetch questions for this lesson from Firestore
    useEffect(() => {
        if (!lessonId || !courseId) return;

        const q = query(
            collection(firestoreDB, 'questions'),
            where('lessonId', '==', lessonId),
            where('courseId', '==', courseId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const questionsData: Question[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                questionsData.push({
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt,
                    answers: data.answers || []
                } as Question);
            });
            setQuestions(questionsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching questions:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [lessonId, courseId]);

    const handleSubmitQuestion = async (title: string, content: string) => {
        if (!user || !title.trim() || !content.trim()) return;

        try {
            await addDoc(collection(firestoreDB, 'questions'), {
                lessonId,
                courseId,
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userRole: isAdmin ? 'Admin' : 'Student',
                userAvatar: user.photoURL || '',
                title: title,
                content: content,
                createdAt: Timestamp.now(),
                isResolved: false,
                likes: 0,
                likedBy: [],
                answers: []
            });
        } catch (error) {
            console.error("Error submitting question:", error);
        }
    };

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
            <div className="p-5">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiMessageSquare className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>Questions & Answers</span>
                    </h3>
                </div>

                {/* Question Input Form */}
                {user && (
                    <div className="mb-6">
                        <AskQuestionForm onSubmit={handleSubmitQuestion} />
                    </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-[color:var(--ai-foreground)]">
                            {questions.length > 0 ? `Questions (${questions.length})` : "Questions"}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Spinner size="lg" color="primary" />
                        </div>
                    ) : questions.length > 0 ? (
                        <QuestionsList
                            questions={questions}
                            lessonId={lessonId}
                            courseId={courseId}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div className="text-center py-8 bg-[color:var(--ai-card-bg)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg">
                            <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                No questions yet. Be the first to ask!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default QASection;