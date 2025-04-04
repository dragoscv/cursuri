'use client'

import React, { useContext } from 'react';
import { AppContext } from '../../../../../components/AppContext';
import LessonContent from '../../../../../components/Lesson/LessonContent';
import LessonNavigation from '../../../../../components/Lesson/LessonNavigation';

export default function LessonDetailPage({ params }) {
    const { courseId, lessonId } = params;
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('LessonDetailPage must be used within an AppContextProvider');
    }

    const { lessons } = context;

    const lesson = lessons[courseId]?.find((l) => l.id === lessonId);
    const previousLesson = lessons[courseId]?.find((l, index, arr) => arr[index + 1]?.id === lessonId);
    const nextLesson = lessons[courseId]?.find((l, index, arr) => arr[index - 1]?.id === lessonId);

    return (
        <div className="container mx-auto px-4 py-8">
            <LessonContent lesson={lesson} />

            <LessonNavigation
                courseId={courseId}
                currentLessonId={lessonId}
                previousLesson={previousLesson}
                nextLesson={nextLesson}
            />
        </div>
    );
}