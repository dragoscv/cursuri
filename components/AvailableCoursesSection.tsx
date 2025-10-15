"use client";
import React, { useState } from 'react';
import CoursesFilter from './Courses/CoursesFilter';
import CoursesList from './Courses/CoursesList';

const AvailableCoursesSection = React.memo(function AvailableCoursesSection() {
    // State for filter and category, as in /courses/page.tsx
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('all');

    return (
        <section id="courses-section" className="relative w-full py-16 bg-[color:var(--ai-background)]">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8 text-center">
                    Available Courses
                </h2>
                {/* Add filter UI */}
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