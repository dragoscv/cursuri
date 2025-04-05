import React from 'react';

interface IconProps {
    className?: string;
}

export const ForwardIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.5 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9h2a7 7 0 0 0-7 7 7 7 0 0 0-7-7 7 7 0 0 0-7-7v3l-6-4 6-4v3Z" />
        </svg>
    );
};

export default ForwardIcon;