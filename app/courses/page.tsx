'use client'

import React, { useState } from 'react';
import CoursesList from '../../components/Courses/CoursesList';
import CoursesFilter from '../../components/Courses/CoursesFilter';

export default function CoursesPage() {
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Courses</h1>

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