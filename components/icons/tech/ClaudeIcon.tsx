import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const ClaudeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Claude AI Icon"
        >
            <rect width="24" height="24" rx="6" fill="#CC9B7A" />
            <path
                fill="white"
                d="M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1.5 3v6h1.25V9h-1.25zm3.25 0v6h1.25v-2.5h1.75a1.25 1.25 0 0 0 0-2.5h-3v-1h-1.25zm1.25 1.5h1.5a.5.5 0 0 1 0 1h-1.5v-1z"
            />
        </svg>
    );
};

export default ClaudeIcon;
