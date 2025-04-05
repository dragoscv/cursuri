import React from 'react';

interface IconProps {
    className?: string;
}

export const PauseIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
    );
};

export default PauseIcon;