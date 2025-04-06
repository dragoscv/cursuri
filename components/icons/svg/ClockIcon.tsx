import React from 'react';
import { IconProps } from '@/types';

const ClockIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, color = "currentColor" }) => {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            fill="none"
            stroke={color}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
};

export default ClockIcon;