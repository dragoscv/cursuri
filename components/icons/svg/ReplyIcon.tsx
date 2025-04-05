// filepath: e:\GitHub\cursuri\components\icons\svg\ReplyIcon.tsx
import React from 'react';
import { IconProps } from '@/types';

const ReplyIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || "20"}
            height={size || "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="9 17 4 12 9 7"></polyline>
            <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
        </svg>
    );
};

export default ReplyIcon;