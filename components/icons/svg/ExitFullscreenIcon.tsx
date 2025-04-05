import React from 'react';

interface IconProps {
    className?: string;
}

export const ExitFullscreenIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
        </svg>
    );
};

export default ExitFullscreenIcon;