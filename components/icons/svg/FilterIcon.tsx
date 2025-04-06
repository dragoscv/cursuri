import React from 'react';
import { IconProps } from '@/types';

const FilterIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => {
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
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    );
};

export default FilterIcon;