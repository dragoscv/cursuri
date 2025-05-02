import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeFirstReview = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
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
                d="M8 10L12 8L16 10L12 12L8 10Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 12V16"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M10 7L9 5M14 7L15 5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M9 18L8 20M15 18L16 20"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default BadgeFirstReview;
