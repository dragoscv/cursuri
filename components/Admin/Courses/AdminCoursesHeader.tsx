import React from 'react';
import { Button } from '@heroui/react';

interface AdminCoursesHeaderProps {
    onAddCourse: () => void;
}

export default function AdminCoursesHeader({ onAddCourse }: AdminCoursesHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Course Management</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Manage your courses, add new content, and edit existing courses.
                    </p>
                </div>
                <Button
                    color="primary"
                    onClick={onAddCourse}
                    startContent={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                >
                    Add Course
                </Button>
            </div>
        </div>
    );
}