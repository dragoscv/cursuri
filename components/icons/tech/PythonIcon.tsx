import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const PythonIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="Python Icon"
        >
            <defs>
                <linearGradient id="python-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#387EB8" />
                    <stop offset="100%" stopColor="#366994" />
                </linearGradient>
                <linearGradient id="python-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFE873" />
                    <stop offset="100%" stopColor="#FFD43B" />
                </linearGradient>
            </defs>
            <path
                fill="url(#python-gradient-1)"
                d="M12 2C9.8 2 8 2.9 8 4.5v3c0 .8.7 1.5 1.5 1.5h5c.8 0 1.5.7 1.5 1.5v1.5H9c-1.7 0-3 1.3-3 3V20c0 1.6 1.8 2.5 4 2.5s4-.9 4-2.5v-3c0-.8-.7-1.5-1.5-1.5h-5c-.8 0-1.5-.7-1.5-1.5V12h7c1.7 0 3-1.3 3-3V4.5C16 2.9 14.2 2 12 2z"
            />
            <path
                fill="url(#python-gradient-2)"
                d="M12 2c2.2 0 4 .9 4 2.5v3c0 .8-.7 1.5-1.5 1.5h-5c-.8 0-1.5.7-1.5 1.5V12h7c1.7 0 3 1.3 3 3v4.5c0 1.6-1.8 2.5-4 2.5s-4-.9-4-2.5v-3c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5-.7 1.5-1.5V12H8c-1.7 0-3-1.3-3-3V4.5C5 2.9 6.8 2 9 2h3z"
            />
            <circle cx="10" cy="5.5" r="1" fill="#366994" />
            <circle cx="14" cy="18.5" r="1" fill="#FFD43B" />
        </svg>
    );
};

export default PythonIcon;
