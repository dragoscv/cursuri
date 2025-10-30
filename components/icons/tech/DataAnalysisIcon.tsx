import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const DataAnalysisIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Data Analysis Icon"
        >
            <path
                fill="currentColor"
                d="M3 3v18h18v-2H5V3H3zm4 12h2v4H7v-4zm4-6h2v10h-2V9zm4 3h2v7h-2v-7zm4-5h2v12h-2V7z"
            />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" opacity="0.7" />
            <circle cx="12" cy="8" r="1.5" fill="currentColor" opacity="0.7" />
            <circle cx="16" cy="10" r="1.5" fill="currentColor" opacity="0.7" />
            <circle cx="20" cy="6" r="1.5" fill="currentColor" opacity="0.7" />
        </svg>
    );
};

export default DataAnalysisIcon;
