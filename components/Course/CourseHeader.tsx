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
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg">
            <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {extendedCourse.title || extendedCourse.name}
                        </h1>

                        <p className="text-white/90 text-lg mb-6 max-w-3xl">
                            {extendedCourse.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-white/80">
                            <div className="flex items-center gap-1">
                                <FiClock />
                                <span>{extendedCourse.duration || '3-5 weeks'}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <FiUsers />
                                <span>{extendedCourse.students || '0'} students</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <FiBook />
                                <span>{extendedCourse.lessonsCount || '0'} lessons</span>
                            </div>

                            {extendedCourse.certificate && (
                                <div className="flex items-center gap-1">
                                    <FiAward />
                                    <span>Certificate</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {extendedCourse.rating && (
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center min-w-[120px]">
                            <div className="text-3xl font-bold text-white mb-1">
                                {typeof extendedCourse.rating === 'number' ? extendedCourse.rating.toFixed(1) : extendedCourse.rating}
                            </div>
                            <div className="text-white/80 text-sm">
                                {extendedCourse.reviewsCount || 0} reviews
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CourseHeader;
