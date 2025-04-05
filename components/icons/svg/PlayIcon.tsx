import React from 'react';

interface IconProps {
    className?: string;
}

export const PlayIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    );
};

export default PlayIcon;