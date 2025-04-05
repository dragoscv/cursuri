import React from 'react';

interface IconProps {
    className?: string;
}

export const RewindIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.5 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9h-2a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7v3l6-4-6-4v3Z" />
        </svg>
    );
};

export default RewindIcon;