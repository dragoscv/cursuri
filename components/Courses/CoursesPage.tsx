'use client'

import React, { useState } from 'react';
import CoursesList from './CoursesList';
import CoursesFilter from './CoursesFilter';
import CoursesHeader from './CoursesHeader';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CoursesPage() {
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('');
    const t = useTranslations('courses.subscriptionBanner');

    return (
        <div className="container mx-auto px-4 py-8">
            <CoursesHeader />

            {/* Subscription recommendation banner */}
            <div className="mb-8 relative overflow-hidden rounded-2xl border border-[color:var(--ai-primary)]/20 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-card-bg)] to-[color:var(--ai-secondary)]/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[color:var(--ai-primary)]/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                    {/* Icon */}
                    <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg shadow-[color:var(--ai-primary)]/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] text-xs font-semibold uppercase tracking-wider">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                            </svg>
                            {t('badge')}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                            {t('title')}
                        </h3>
                        <p className="text-[color:var(--ai-muted)] text-sm md:text-base mb-4 max-w-2xl">
                            {t('description')}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[color:var(--ai-foreground)]">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[color:var(--ai-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t('benefit1')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[color:var(--ai-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t('benefit2')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[color:var(--ai-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t('benefit3')}
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0">
                        <Link
                            href="/subscriptions"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-semibold rounded-xl shadow-lg shadow-[color:var(--ai-primary)]/20 hover:shadow-xl hover:shadow-[color:var(--ai-primary)]/30 hover:scale-105 transition-all duration-300"
                        >
                            {t('cta')}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            <CoursesFilter
                onFilterChange={setFilter}
                onCategoryChange={setCategory}
                currentFilter={filter}
                currentCategory={category}
            />

            <CoursesList filter={filter} category={category} />
        </div>
    );
}
