import React from 'react';
import { IconProps } from '@/types';

const StarIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, color = "currentColor" }) => {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            fill={color}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path fillRule="evenodd" d="M10 15.934l-6.242 3.282.19-7.272-5.26-5.129 7.272-1.049L10 0l4.04 5.766 7.273 1.049-5.26 5.129.19 7.272L10 15.934z" clipRule="evenodd"></path>
        </svg>
    );
};

export default StarIcon;