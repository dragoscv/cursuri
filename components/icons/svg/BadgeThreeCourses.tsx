import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeThreeCourses = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
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
                d="M8 8H10C11.1046 8 12 8.89543 12 10V10C12 11.1046 11.1046 12 10 12H8V8Z"
                stroke={color}
                strokeWidth="1.5"
            />
            <path
                d="M8 12H10C11.1046 12 12 12.8954 12 14V14C12 15.1046 11.1046 16 10 16H8V12Z"
                stroke={color}
                strokeWidth="1.5"
            />
            <path
                d="M14 8H16V16"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 12H16"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M9 18L8 20M15 18L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default BadgeThreeCourses;
