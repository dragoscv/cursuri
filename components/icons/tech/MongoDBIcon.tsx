import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

const MongoDBIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width={size}
            height={size}
            className={`inline-block ${className}`}
            role="img"
            aria-label="MongoDB Icon"
        >
            <path fill="#13aa52" d="M256 192c4-92-78-92-82-92-64 0-83 46-83 69 0 98 92 145 180 208 88-63 180-118 180-208 0-39-21-69-80-69-4 0-86-2-82 92h-33z" />
            <path fill="#b8c4c2" d="M256 192c4-92-78-92-82-92-64 0-83 46-83 69 0 98 92 145 180 208 0-104 36-115 0-186h-15z" />
            <path fill="#a6bab8" d="M271 192c0-92-78-92-82-92-64 0-83 46-83 69 0 98 92 145 180 208-17-65-35-113-15-185z" />
            <path fill="#13aa52" d="M350 148c-7-30-39-45-94-45h-97c-9 0-19 0-19 9v197c0 9 10 11 19 11h35c9 0 18 0 18-11v-60h37c51 0 65-25 65-74 0-12-1-19-1-27h37z" />
            <path fill="#13aa52" d="M256 286c2-58-50-58-54-58-41 0-53 30-53 44 0 62 59 92 116 132 56-40 116-75 116-132 0-25-14-44-51-44-3 0-56-1-53 58h-21z" />
        </svg>
    );
};

export default MongoDBIcon;