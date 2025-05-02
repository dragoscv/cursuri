'use client';

import React from 'react';

const LessonLoadingSkeleton: React.FC = () => {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div className="h-10 w-40 bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg"></div>
                <div className="h-10 w-28 bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg"></div>
            </div>

            {/* Title and description */}
            <div className="mb-8">
                <div className="h-12 w-3/4 bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg mb-4"></div>
                <div className="h-6 w-1/2 bg-[color:var(--ai-card-border)]/40 dark:bg-[color:var(--ai-card-border)]/20 rounded-lg"></div>
            </div>

            {/* Video player skeleton */}
            <div className="aspect-video w-full bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-xl mb-8"></div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-[color:var(--ai-card-border)]/40 dark:bg-[color:var(--ai-card-border)]/20 rounded-full mb-8"></div>

            {/* Controls row */}
            <div className="flex flex-wrap gap-4 mb-8">
                <div className="h-10 w-24 bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg"></div>
                <div className="h-10 w-24 bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg"></div>
                <div className="h-10 w-24 bg-[color:var(--ai-card-border)]/50 dark:bg-[color:var(--ai-card-border)]/30 rounded-lg"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
                <div className="h-6 w-full bg-[color:var(--ai-card-border)]/40 dark:bg-[color:var(--ai-card-border)]/20 rounded-lg"></div>
                <div className="h-6 w-5/6 bg-[color:var(--ai-card-border)]/40 dark:bg-[color:var(--ai-card-border)]/20 rounded-lg"></div>
                <div className="h-6 w-4/6 bg-[color:var(--ai-card-border)]/40 dark:bg-[color:var(--ai-card-border)]/20 rounded-lg"></div>
                <div className="h-6 w-3/6 bg-[color:var(--ai-card-border)]/40 dark:bg-[color:var(--ai-card-border)]/20 rounded-lg"></div>
            </div>
        </div>
    );
};

export default LessonLoadingSkeleton;