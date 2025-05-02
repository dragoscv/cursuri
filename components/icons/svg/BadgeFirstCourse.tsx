import React from 'react';

interface BadgeProps {
    className?: string;
    size?: number;
    color?: string;
}

export const BadgeFirstCourse = ({ className = "", size = 24, color = "currentColor" }: BadgeProps) => {
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
                d="M12 6L13.6515 9.56434L17.5 10.0777L14.75 12.7957L15.303 16.75L12 14.87L8.697 16.75L9.25 12.7957L6.5 10.0777L10.3485 9.56434L12 6Z"
                fill={color}
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M8 17L9 19M16 17L15 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default BadgeFirstCourse;
