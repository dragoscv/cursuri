"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import CoursesFilter from './Courses/CoursesFilter';
import CoursesList from './Courses/CoursesList';

const AvailableCoursesSection = React.memo(function AvailableCoursesSection() {
    const t = useTranslations('home.availableCourses');
    // State for filter and category, as in /courses/page.tsx
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('all');

    return (
        <section id="courses-section" className="relative w-full py-20 md:py-28 bg-[color:var(--section-accent-bg)] dark:bg-[color:var(--section-dark-bg)]">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--ai-foreground)] mb-4">
                        {t('title')}
                    </h2>
                </div>
                {/* Filter UI */}
                <CoursesFilter
                    onFilterChange={setFilter}
                    onCategoryChange={setCategory}
                    currentFilter={filter}
                    currentCategory={category}
                />
                {/* Filtered course list */}
                <CoursesList filter={filter} category={category} />
            </div>
        </section>
    );
});

export default AvailableCoursesSection;