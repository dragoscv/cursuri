import React from 'react';
import { Course } from '../../types';
import { Badge, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiBook, FiAward } from '../icons/FeatherIcons';

interface CourseHeaderProps {
    course: Course;
}

// Extended properties that might be used in the component but aren't in the Course type
interface ExtendedCourse extends Course {
    isFeatured?: boolean;
    isNew?: boolean;
    level?: string;
    title?: string;
    students?: number;
    lessonsCount?: number;
    certificate?: boolean;
    rating?: number | string;
    reviewsCount?: number;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
    // Cast to extended type to avoid errors
    const extendedCourse = course as ExtendedCourse;

    return (
        <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {extendedCourse.isFeatured && (
                            <Chip color="warning" variant="flat" className="text-xs">Featured</Chip>
                        )}
                        {extendedCourse.isNew && (
                            <Chip color="success" variant="flat" className="text-xs">New</Chip>
                        )}
                        {extendedCourse.level && (
                            <Chip color="primary" variant="flat" className="text-xs">
                                {extendedCourse.level}
                            </Chip>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {extendedCourse.title || extendedCourse.name}
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                        {extendedCourse.description}
                    </p>
                </div>

                {extendedCourse.rating && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Course Rating</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {typeof extendedCourse.rating === 'number' ? extendedCourse.rating.toFixed(1) : extendedCourse.rating}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {extendedCourse.reviewsCount || 0} reviews
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                    <FiClock className="text-indigo-500" />
                    <span>{extendedCourse.duration || '3-5 weeks'}</span>
                </div>

                <div className="flex items-center gap-1">
                    <FiUsers className="text-indigo-500" />
                    <span>{extendedCourse.students || '0'} students</span>
                </div>

                <div className="flex items-center gap-1">
                    <FiBook className="text-indigo-500" />
                    <span>{extendedCourse.lessonsCount || '0'} lessons</span>
                </div>

                {extendedCourse.certificate && (
                    <div className="flex items-center gap-1">
                        <FiAward className="text-indigo-500" />
                        <span>Certificate</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseHeader;
