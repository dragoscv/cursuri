'use client'

import React, { useState } from 'react';
import CoursesList from './CoursesList';
import CoursesFilter from './CoursesFilter';
import CoursesHeader from './CoursesHeader';

export default function CoursesPage() {
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('');

    return (
        <div className="container mx-auto px-4 py-8">
            <CoursesHeader />

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
