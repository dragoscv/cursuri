import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeTenLessons = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
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
                d="M8 9H16M8 12H14M8 15H12"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M7 6H17"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path d="M9 18L8 20M15 18L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <rect x="5" y="8" width="2" height="8" rx="1" stroke={color} strokeWidth="1" />
        </svg>
    );
};

export default BadgeTenLessons;
