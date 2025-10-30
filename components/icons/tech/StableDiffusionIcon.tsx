import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const StableDiffusionIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Stable Diffusion Icon"
        >
            <defs>
                <linearGradient id="sd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="100%" stopColor="#4ECDC4" />
                </linearGradient>
            </defs>
            <rect width="24" height="24" rx="4" fill="url(#sd-gradient)" />
            <path
                fill="white"
                d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
                opacity="0.9"
            />
        </svg>
    );
};

export default StableDiffusionIcon;
