import React from 'react';

interface NeuralNetworkIconProps {
    className?: string;
}

export default function NeuralNetworkIcon({ className = "absolute inset-0 w-full h-full opacity-20" }: NeuralNetworkIconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
            </defs>
            {/* Horizontal lines */}
            <line x1="20" y1="20" x2="80" y2="20" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
            <line x1="30" y1="80" x2="70" y2="80" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />

            {/* Vertical lines */}
            <line x1="30" y1="10" x2="30" y2="90" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />
            <line x1="70" y1="10" x2="70" y2="90" stroke="url(#line-gradient)" strokeWidth="0.2" className="neural-network-line" />

            {/* Nodes */}
            <circle cx="30" cy="20" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="50" cy="20" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="70" cy="20" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="30" cy="50" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="50" cy="50" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="70" cy="50" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="30" cy="80" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="50" cy="80" r="1" fill="#8B5CF6" className="neural-node" />
            <circle cx="70" cy="80" r="1" fill="#8B5CF6" className="neural-node" />
        </svg>
    );
}