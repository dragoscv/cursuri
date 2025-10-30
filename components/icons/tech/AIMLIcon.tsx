import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const AIMLIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="AI & ML Icon"
        >
            <defs>
                <linearGradient id="aiml-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="50%" stopColor="#9B59B6" />
                    <stop offset="100%" stopColor="#3498DB" />
                </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#aiml-gradient)" opacity="0.2" />
            <path
                fill="url(#aiml-gradient)"
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
            />
            <circle cx="8" cy="10" r="1.5" fill="url(#aiml-gradient)" />
            <circle cx="16" cy="10" r="1.5" fill="url(#aiml-gradient)" />
            <path
                fill="none"
                stroke="url(#aiml-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                d="M8 15c1 1.5 2.5 2 4 2s3-.5 4-2"
            />
            <path
                fill="url(#aiml-gradient)"
                d="M12 7l-1 2h2l-1 2"
                opacity="0.7"
            />
        </svg>
    );
};

export default AIMLIcon;
