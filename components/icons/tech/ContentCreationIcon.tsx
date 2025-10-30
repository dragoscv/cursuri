import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const ContentCreationIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Content Creation Icon"
        >
            <path
                fill="currentColor"
                d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z"
            />
            <path
                fill="currentColor"
                opacity="0.5"
                d="M18 13v6c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h6"
            />
        </svg>
    );
};

export default ContentCreationIcon;
