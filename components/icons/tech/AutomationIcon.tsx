import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const AutomationIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="AI Automation Icon"
        >
            <path
                fill="currentColor"
                d="M12 2L4 5v6.5c0 5.25 3.64 10.15 8 11.5 4.36-1.35 8-6.25 8-11.5V5l-8-3zm0 2.18l6 2.25v4.82c0 4.44-2.84 8.61-6 9.75-3.16-1.14-6-5.31-6-9.75V6.43l6-2.25zM10 9v2h4V9h-2zm-2 4v2h8v-2H8zm2 4v2h4v-2h-4z"
            />
            <circle cx="7" cy="10" r="1" fill="currentColor" />
            <circle cx="17" cy="10" r="1" fill="currentColor" />
        </svg>
    );
};

export default AutomationIcon;
