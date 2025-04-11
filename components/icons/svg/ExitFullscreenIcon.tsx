import React from 'react';
import { IconProps } from '@/types';

const ExitFullscreenIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || "20"}
            height={size || "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M4 14h3a3 3 0 0 1 3 3v3"></path>
            <path d="M14 10h3a3 3 0 0 0 3-3V4"></path>
            <path d="M10 4v3a3 3 0 0 1-3 3H4"></path>
            <path d="M20 14v3a3 3 0 0 1-3 3h-3"></path>
        </svg>
    );
};

export default ExitFullscreenIcon;
