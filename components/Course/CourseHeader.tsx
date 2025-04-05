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
        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[color:var(--ai-card-border)]/50 shadow-xl">
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

                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">
                        {extendedCourse.title || extendedCourse.name}
                    </h1>

                    <p className="text-[color:var(--ai-muted)] max-w-2xl">
                        {extendedCourse.description}
                    </p>
                </div>

                {extendedCourse.rating && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-[color:var(--ai-muted)]">Course Rating</span>
                            <span className="font-semibold text-[color:var(--ai-primary)]">
                                {typeof extendedCourse.rating === 'number' ? extendedCourse.rating.toFixed(1) : extendedCourse.rating}
                            </span>
                        </div>
                        <div className="text-sm text-[color:var(--ai-muted)]">
                            {extendedCourse.reviewsCount || 0} reviews
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 text-[color:var(--ai-muted)]">
                <div className="flex items-center gap-1">
                    <FiClock className="text-[color:var(--ai-primary)]" />
                    <span>{extendedCourse.duration || '3-5 weeks'}</span>
                </div>

                <div className="flex items-center gap-1">
                    <FiUsers className="text-[color:var(--ai-primary)]" />
                    <span>{extendedCourse.students || '0'} students</span>
                </div>

                <div className="flex items-center gap-1">
                    <FiBook className="text-[color:var(--ai-primary)]" />
                    <span>{extendedCourse.lessonsCount || '0'} lessons</span>
                </div>

                {extendedCourse.certificate && (
                    <div className="flex items-center gap-1">
                        <FiAward className="text-[color:var(--ai-primary)]" />
                        <span>Certificate</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseHeader;
