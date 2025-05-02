'use client'

import React, { useMemo } from 'react'

export default function AnimatedParticles() {
    // Pre-calculate particle properties with fixed precision to avoid hydration mismatch
    const particles = useMemo(() => {
        // Use a deterministic seed for consistent values
        const seed = 42;
        const particles = [];

        function pseudoRandom(seed: number, index: number): number {
            // Deterministic pseudo-random generator
            return parseFloat(((Math.sin(seed * index) * 10000) % 1).toFixed(2));
        }

        // Reduce number of particles from 20 to 10 to improve performance
        for (let i = 0; i < 10; i++) {
            // Create fixed-precision values that will be consistent
            const width = (5 + pseudoRandom(seed, i * 1.1) * 10).toFixed(2);
            const height = (5 + pseudoRandom(seed, i * 2.2) * 15).toFixed(2);
            const top = (pseudoRandom(seed, i * 3.3) * 100).toFixed(2);
            const left = (pseudoRandom(seed, i * 4.4) * 100).toFixed(2);
            const duration = (3 + pseudoRandom(seed, i * 5.5) * 5).toFixed(2);
            const delay = (pseudoRandom(seed, i * 6.6) * 5).toFixed(2);

            particles.push({
                key: i,
                width,
                height,
                top,
                left,
                duration,
                delay
            });
        }

        return particles;
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.key}
                    className="absolute rounded-full bg-white/30 animate-float"
                    style={{
                        width: `${particle.width}px`,
                        height: `${particle.height}px`,
                        top: `${particle.top}%`,
                        left: `${particle.left}%`,
                        animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                        opacity: 0.3
                    }}
                />
            ))}
        </div>
    )
}
