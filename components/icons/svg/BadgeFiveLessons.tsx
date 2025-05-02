import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeFiveLessons = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
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
                d="M8 10H16M8 14H13"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M7 7H17"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path d="M10 17L9 19M14 17L15 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 12L7 11L8 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default BadgeFiveLessons;
