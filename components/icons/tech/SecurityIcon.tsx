import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const SecurityIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Cybersecurity Icon"
        >
            <defs>
                <linearGradient id="security-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E63946" />
                    <stop offset="100%" stopColor="#C1121F" />
                </linearGradient>
            </defs>
            <path
                fill="url(#security-gradient)"
                d="M12 2L4 5v6.5c0 5.25 3.64 10.15 8 11.5 4.36-1.35 8-6.25 8-11.5V5l-8-3zm0 2.18l6 2.25v4.82c0 4.44-2.84 8.61-6 9.75-3.16-1.14-6-5.31-6-9.75V6.43l6-2.25z"
            />
            <path
                fill="url(#security-gradient)"
                d="M10.09 14.91L8 12.82 9.41 11.41 10.09 12.09 14.59 7.59 16 9z"
            />
        </svg>
    );
};

export default SecurityIcon;
