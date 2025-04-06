import React from 'react';
import { IconProps } from '@/types';

const MoneyIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => {
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="6" x2="12" y2="12"></line>
            <path d="M12 17h.01"></path>
        </svg>
    );
};

export default MoneyIcon;