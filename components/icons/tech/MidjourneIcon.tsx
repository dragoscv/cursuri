import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const MidjourneyIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Midjourney Icon"
        >
            <path
                fill="currentColor"
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.564 17.303l-1.373-2.376-1.373 2.376H13.37l1.373-2.376L12 11.291l-2.743 3.636 1.373 2.376h-2.448l-1.373-2.376-1.373 2.376H3.436l3.318-5.73L3.436 6.697h2.448l1.373 2.376 1.373-2.376h2.448l-1.373 2.376L12 12.709l2.743-3.636-1.373-2.376h2.448l1.373 2.376 1.373-2.376h2.448l-3.318 5.73 3.318 5.73-2.448.143z"
            />
        </svg>
    );
};

export default MidjourneyIcon;
