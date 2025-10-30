import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const PromptEngineeringIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Prompt Engineering Icon"
        >
            <path
                fill="currentColor"
                d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm15-6l4 4-4 4v-3h-3v-2h3v-3z"
            />
            <circle cx="16" cy="15" r="1" fill="currentColor" />
        </svg>
    );
};

export default PromptEngineeringIcon;
