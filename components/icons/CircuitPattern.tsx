import React from 'react';

interface CircuitPatternProps {
    className?: string;
}

export default function CircuitPattern({ className }: CircuitPatternProps) {
    return (
        <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <pattern id="circuit-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 0 25 L 50 25 M 25 0 L 25 50" stroke="white" stroke-width="0.3" fill="none" />
                </pattern>
            </defs>

            {/* Base Grid */}
            <rect width="100%" height="100%" fill="url(#circuit-grid)" opacity="0.2" />

            {/* Circuit nodes and connections */}
            <g fill="none" stroke="white" stroke-width="0.8">
                {/* Horizontal lines */}
                <path d="M 25 50 L 125 50 L 125 100 L 200 100" />
                <path d="M 50 150 L 175 150 L 175 200 L 300 200" />
                <path d="M 100 250 L 225 250 L 225 300 L 350 300" />
                <path d="M 75 350 L 275 350 L 275 200" />

                {/* Vertical lines */}
                <path d="M 75 25 L 75 175 L 125 175 L 125 275" />
                <path d="M 175 75 L 175 125 L 225 125 L 225 225" />
                <path d="M 325 125 L 325 275 L 375 275 L 375 375" />
                <path d="M 275 25 L 275 125" />

                {/* Circuit nodes */}
                <circle cx="25" cy="50" r="3" fill="white" />
                <circle cx="75" cy="25" r="3" fill="white" />
                <circle cx="75" cy="175" r="3" fill="white" />
                <circle cx="125" cy="50" r="3" fill="white" />
                <circle cx="125" cy="100" r="3" fill="white" />
                <circle cx="125" cy="175" r="3" fill="white" />
                <circle cx="125" cy="275" r="3" fill="white" />
                <circle cx="175" cy="75" r="3" fill="white" />
                <circle cx="175" cy="150" r="3" fill="white" />
                <circle cx="175" cy="200" r="3" fill="white" />
                <circle cx="200" cy="100" r="3" fill="white" />
                <circle cx="225" cy="125" r="3" fill="white" />
                <circle cx="225" cy="225" r="3" fill="white" />
                <circle cx="225" cy="250" r="3" fill="white" />
                <circle cx="225" cy="300" r="3" fill="white" />
                <circle cx="275" cy="25" r="3" fill="white" />
                <circle cx="275" cy="125" r="3" fill="white" />
                <circle cx="275" cy="200" r="3" fill="white" />
                <circle cx="275" cy="350" r="3" fill="white" />
                <circle cx="300" cy="200" r="3" fill="white" />
                <circle cx="325" cy="125" r="3" fill="white" />
                <circle cx="325" cy="275" r="3" fill="white" />
                <circle cx="350" cy="300" r="3" fill="white" />
                <circle cx="375" cy="275" r="3" fill="white" />
                <circle cx="375" cy="375" r="3" fill="white" />
            </g>

            {/* Larger circuit elements */}
            <g>
                {/* CPU/Processor */}
                <rect x="125" y="175" width="50" height="50" fill="none" stroke="white" stroke-width="1" />
                <circle cx="150" cy="200" r="15" fill="none" stroke="white" stroke-width="0.8" />
                <path d="M 140 200 L 160 200 M 150 190 L 150 210" stroke="white" stroke-width="1" />

                {/* Memory unit */}
                <rect x="225" y="225" width="40" height="25" fill="none" stroke="white" stroke-width="0.8" />
                <line x1="235" y1="225" x2="235" y2="250" stroke="white" stroke-width="0.5" />
                <line x1="245" y1="225" x2="245" y2="250" stroke="white" stroke-width="0.5" />
                <line x1="255" y1="225" x2="255" y2="250" stroke="white" stroke-width="0.5" />

                {/* Neural node */}
                <circle cx="325" cy="175" r="20" fill="none" stroke="white" stroke-width="0.8" />
                <circle cx="325" cy="175" r="10" fill="none" stroke="white" stroke-width="0.5" />
                <path d="M 315 165 L 335 185 M 315 185 L 335 165" stroke="white" stroke-width="0.5" />

                {/* Data processing unit */}
                <rect x="75" y="275" width="30" height="30" fill="none" stroke="white" stroke-width="0.8" />
                <path d="M 85 280 L 95 280 L 95 290 L 85 290 L 85 300 L 95 300" stroke="white" stroke-width="0.5" />
            </g>

            {/* Small animated elements (will be animated with CSS) */}
            <g className="data-flow">
                <circle cx="75" cy="175" r="1.5" fill="white" className="pulse-node" />
                <circle cx="125" cy="100" r="1.5" fill="white" className="pulse-node" />
                <circle cx="200" cy="100" r="1.5" fill="white" className="pulse-node" />
                <circle cx="325" cy="175" r="1.5" fill="white" className="pulse-node" />
                <circle cx="275" cy="200" r="1.5" fill="white" className="pulse-node" />
            </g>
        </svg>
    );
}