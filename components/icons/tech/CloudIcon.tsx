import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const CloudIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Cloud Computing Icon"
        >
            <defs>
                <linearGradient id="cloud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00A8E8" />
                    <stop offset="100%" stopColor="#007EA7" />
                </linearGradient>
            </defs>
            <path
                fill="url(#cloud-gradient)"
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17C6.37 5.07 5 6.64 5 8.5c0 .34.04.67.11.98C2.79 10.06 1 12.13 1 14.58 1 17.47 3.03 20 5.5 20h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM18.5 18h-13C4.13 18 3 16.87 3 15.5S4.13 13 5.5 13H6c0-2.21 1.79-4 4-4 1.38 0 2.6.7 3.32 1.76.41-.12.84-.18 1.28-.18 2.21 0 4 1.79 4 4h.9c1.66 0 3 1.34 3 3s-1.34 3-3 3z"
            />
        </svg>
    );
};

export default CloudIcon;
