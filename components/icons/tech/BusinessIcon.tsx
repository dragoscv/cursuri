import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const BusinessIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Business Strategy Icon"
        >
            <defs>
                <linearGradient id="business-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9B51E0" />
                    <stop offset="100%" stopColor="#7209B7" />
                </linearGradient>
            </defs>
            <path
                fill="url(#business-gradient)"
                d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z"
            />
            <path
                fill="url(#business-gradient)"
                d="M8 10h2v7H8zm4 0h2v7h-2zm4 0h2v7h-2z"
                opacity="0.7"
            />
        </svg>
    );
};

export default BusinessIcon;
