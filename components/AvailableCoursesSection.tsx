import React from 'react';
import Courses from './Courses';

export default function AvailableCoursesSection() {
    return (
        <div id="courses-section" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Available Courses
            </h2>
            <Courses />
        </div>
    );
}