'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

// Import the actual component
const LessonDetailImport = dynamic(() => import('./LessonDetailComponent'), {
    ssr: true,
    loading: () => (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="h-8 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded w-2/3 mb-8"></div>
                <div className="rounded-lg bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] h-96 mb-4"></div>
                <div className="h-10 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded w-full mb-4"></div>
            </div>
        </div>
    )
});

interface LessonDetailProps {
    params: {
        courseId: string;
        lessonId: string;
    };
}

// Create a wrapper component
const LessonDetail: React.FC<LessonDetailProps> = ({ params }) => {
    const t = useTranslations('courses.lesson');

    // Ensure params are defined and not promises
    if (!params || typeof params.courseId !== 'string' || typeof params.lessonId !== 'string') {
        console.error("Invalid params passed to LessonDetail:", params);
        return <div className="p-8 text-center">{t('errorInvalidParams')}</div>;
    }

    return <LessonDetailImport params={params} />;
};

export default LessonDetail;
