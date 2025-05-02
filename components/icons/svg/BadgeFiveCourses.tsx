import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeFiveCourses = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <path
                d="M8 8H16V10H10V12H15V14H10V16H16"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M9 18L8 20M15 18L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="0.75" strokeDasharray="1 1" />
        </svg>
    );
};

export default BadgeFiveCourses;
