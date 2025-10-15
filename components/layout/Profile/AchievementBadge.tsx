'use client';

import React from 'react';
import { BadgeFirstCourse } from '@/components/icons/svg/BadgeFirstCourse';
import { BadgeFiveLessons } from '@/components/icons/svg/BadgeFiveLessons';
import { BadgeTenLessons } from '@/components/icons/svg/BadgeTenLessons';
import { BadgeThreeCourses } from '@/components/icons/svg/BadgeThreeCourses';
import { BadgeFiveCourses } from '@/components/icons/svg/BadgeFiveCourses';
import { BadgeFirstReview } from '@/components/icons/svg/BadgeFirstReview';
import { BadgeLoginStreak7 } from '@/components/icons/svg/BadgeLoginStreak7';
import { BadgeLoginStreak30 } from '@/components/icons/svg/BadgeLoginStreak30';

// Map achievement IDs to their corresponding badge components
const BadgeMap = {
    'first_course': BadgeFirstCourse,
    'five_lessons': BadgeFiveLessons,
    'ten_lessons': BadgeTenLessons,
    'three_courses': BadgeThreeCourses,
    'five_courses': BadgeFiveCourses,
    'first_review': BadgeFirstReview,
    'login_streak_7': BadgeLoginStreak7,
    'login_streak_30': BadgeLoginStreak30,
};

// Badge colors for each achievement
export const BadgeColors = {
    'first_course': '#3B82F6', // blue-500
    'five_lessons': '#8B5CF6', // purple-500
    'ten_lessons': '#10B981', // emerald-500
    'three_courses': '#F59E0B', // amber-500
    'five_courses': '#EC4899', // pink-500
    'first_review': '#6366F1', // indigo-500
    'login_streak_7': '#0EA5E9', // sky-500
    'login_streak_30': '#F97316', // orange-500
};

interface AchievementBadgeProps {
    id: string;
    className?: string;
    size?: number;
}

function AchievementBadge({ id, className = '', size = 24 }: AchievementBadgeProps) {
    // Get the badge component for this achievement ID
    const BadgeComponent = BadgeMap[id as keyof typeof BadgeMap];

    // If we don't have a matching component, return a fallback
    if (!BadgeComponent) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    // Return the badge component with the correct color
    return <BadgeComponent className={className} size={size} color={BadgeColors[id as keyof typeof BadgeColors]} />;
}

export default AchievementBadge;
