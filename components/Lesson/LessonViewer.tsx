'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import LessonContent from '@/components/Lesson/LessonContent';
import { Spinner } from '@heroui/react';
import Button from '@/components/ui/Button';
import { Lesson as LessonType } from '@/types';

interface LessonViewerProps {
    courseId: string;
    lessonId: string;
}

export default function LessonViewer({ courseId, lessonId }: LessonViewerProps) {
    const t = useTranslations('lessons.viewer');
    const router = useRouter();
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonType | null>(null);

    if (!context) {
        throw new Error('LessonViewer must be used within an AppContextProvider');
    }

    const { getCourseLessons, getLessonById } = context;

    useEffect(() => {
        const loadLesson = async () => {
            try {
                setIsLoading(true);

                // Try to get lesson directly
                let lesson = await getLessonById(courseId, lessonId);

                // If not found, try loading all course lessons first
                if (!lesson) {
                    await getCourseLessons(courseId, { persist: true, ttl: 60 * 60 * 1000 }); // Cache for 1 hour

                    // Try again after loading all lessons
                    lesson = await getLessonById(courseId, lessonId);
                }

                if (lesson) {
                    setLessonData(lesson as LessonType);
                    setError(null);
                } else {
                    setError('Lesson not found');
                }
            } catch (err) {
                console.error('Error loading lesson:', err);
                setError('Failed to load lesson');
            } finally {
                setIsLoading(false);
            }
        };

        loadLesson();
    }, [courseId, lessonId, getCourseLessons, getLessonById]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner color="primary" size="lg" />
                <span className="ml-2">{t('loadingLesson')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-[color:var(--ai-danger)] mb-4">{t('error', { error })}</h2>
                <p className="mb-6">{t('problemLoading')}</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button color="primary" onClick={() => router.push(`/courses/${courseId}`)}>
                        {t('returnToCourse')}
                    </Button>
                    <Button
                        variant="flat"
                        onClick={() => {
                            fetch(`/api/sync-lesson?courseId=${courseId}&lessonId=${lessonId}`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        window.location.reload();
                                    } else {
                                        alert(t('couldNotSync'));
                                    }
                                });
                        }}
                    >
                        {t('syncRetry')}
                    </Button>
                </div>
            </div>
        );
    }

    if (!lessonData) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">{t('lessonNotAvailable')}</h2>
                <p className="mb-6">{t('lessonNotExist')}</p>
                <Button color="primary" onClick={() => router.push(`/courses/${courseId}`)}>
                    {t('returnToCourse')}
                </Button>
            </div>
        );
    }

    return <LessonContent lesson={lessonData} course={context.courses[courseId]} />;
}

