import React from 'react';

export default function CoursesHeader() {
    return (
        <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Explore Our Courses</h1>
            <p className="text-gray-600 dark:text-gray-300">
                Discover high-quality courses to advance your skills and knowledge.
            </p>
        </div>
    );
}