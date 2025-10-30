import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const CopilotIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="GitHub Copilot Icon"
        >
            <path
                fill="currentColor"
                d="M9.75 14a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75zm4.5 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75z"
            />
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM7.99 9.31c0-1.381 1.119-2.5 2.5-2.5h3.02c1.381 0 2.5 1.119 2.5 2.5v.69c0 .414-.336.75-.75.75h-6.52a.75.75 0 0 1-.75-.75v-.69zm11.76 3.44l-.001.09v3.85l-.001.15c-.087 2.12-1.838 3.82-3.979 3.82h-5.558c-2.141 0-3.892-1.7-3.979-3.82L6.23 16.69v-3.85l.001-.09a6.981 6.981 0 0 1 1.394-3.43l.05-.06c.31-.35.72-.63 1.18-.8a4.502 4.502 0 0 1 1.735-.36h5.82c.584 0 1.174.12 1.735.36.46.17.87.45 1.18.8l.05.06c.613.71 1.06 1.57 1.313 2.49.18.66.248 1.35.248 2.03z"
            />
        </svg>
    );
};

export default CopilotIcon;
