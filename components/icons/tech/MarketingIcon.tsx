import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const MarketingIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Digital Marketing Icon"
        >
            <defs>
                <linearGradient id="marketing-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9F1C" />
                    <stop offset="100%" stopColor="#FF6B35" />
                </linearGradient>
            </defs>
            <path
                fill="url(#marketing-gradient)"
                d="M18 11c0-3.866-3.134-7-7-7s-7 3.134-7 7v2H2v6h4v-6H4v-2c0-2.757 2.243-5 5-5s5 2.243 5 5v2h-2v6h4v-6h-2v-2z"
            />
            <path
                fill="url(#marketing-gradient)"
                d="M17 16h5v2h-5zm-4 3h9v2h-9z"
                opacity="0.7"
            />
            <circle cx="11" cy="11" r="1.5" fill="url(#marketing-gradient)" />
        </svg>
    );
};

export default MarketingIcon;
