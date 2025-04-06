'use client'

import React, { useState } from 'react';
import CoursesList from '../../components/Courses/CoursesList';
import CoursesFilter from '../../components/Courses/CoursesFilter';
import CoursesHeader from '../../components/Courses/CoursesHeader';

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