import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeLoginStreak30 = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
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
                d="M9 8C9 7.44772 9.44772 7 10 7H14C14.5523 7 15 7.44772 15 8V16C15 16.5523 14.5523 17 14 17H10C9.44772 17 9 16.5523 9 16V8Z"
                stroke={color}
                strokeWidth="1.5"
            />
            <path
                d="M7 10V14"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M17 10V14"
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
            <path
                d="M9 5L8 3M15 5L16 3"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default BadgeLoginStreak30;
