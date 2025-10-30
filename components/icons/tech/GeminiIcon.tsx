import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const GeminiIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Google Gemini Icon"
        >
            <defs>
                <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="50%" stopColor="#9B72CB" />
                    <stop offset="100%" stopColor="#D96570" />
                </linearGradient>
            </defs>
            <path
                fill="url(#gemini-gradient)"
                d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.48l7 3.51v7.03l-7-3.5V9.48zm16 0v7.04l-7 3.5v-7.03l7-3.51z"
            />
        </svg>
    );
};

export default GeminiIcon;
