import React from 'react';
import { IconProps } from '@/types';

const AutoplayIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || "20"}
            height={size || "20"}
            viewBox="0 0 20 20"
            fill="currentColor"
            className={className}
        >
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
        </svg>
    );
};

export default AutoplayIcon;