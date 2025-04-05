import React from 'react';

interface IconProps {
    className?: string;
}

export const PlaybackSpeedIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 8v8l6-4-6-4zm6.33-1.17a8.03 8.03 0 0 1 2.93 7.83 8.01 8.01 0 0 1-6.93 6.13 8.1 8.1 0 0 1-8.16-3.08 7.97 7.97 0 0 1-1.33-8.17 8 8 0 0 1 7.16-4.37c2.21 0 4.21.89 5.67 2.33l1.41-1.41A10 10 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07l-1.41 1.41z" />
        </svg>
    );
};

export default PlaybackSpeedIcon;