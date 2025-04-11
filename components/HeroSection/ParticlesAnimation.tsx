'use client'

import React, { useEffect, useRef } from 'react';

export default function ParticlesAnimation() {
    const particlesRef = useRef<HTMLDivElement>(null);

    // Create floating particles animation
    useEffect(() => {
        if (!particlesRef.current) return;

        const createParticle = () => {
            const particle = document.createElement('div');

            // Random size between 5px and 15px
            const size = Math.random() * 10 + 5;

            // Apply styling to the particle
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = 'rgba(255, 255, 255, 0.1)';
            particle.style.borderRadius = '50%';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.transform = 'scale(0)';
            particle.style.opacity = '0';
            particle.style.animation = `float-particle ${Math.random() * 10 + 10}s linear infinite`;

            // Apply animation styling to head if it doesn't exist already
            if (!document.getElementById('particle-animation-style')) {
                const style = document.createElement('style');
                style.id = 'particle-animation-style';
                style.innerHTML = `
          @keyframes float-particle {
            0% {
              transform: translateY(0) scale(0);
              opacity: 0;
            }
            10% {
              transform: translateY(-10px) scale(1);
              opacity: 0.4;
            }
            90% {
              transform: translateY(-${Math.random() * 200 + 100}px) scale(0.8);
              opacity: 0.2;
            }
            100% {
              transform: translateY(-${Math.random() * 250 + 150}px) scale(0);
              opacity: 0;
            }
          }
        `;
                document.head.appendChild(style);
            }

            // Add to the DOM
            particlesRef.current?.appendChild(particle);

            // Remove after animation
            setTimeout(() => {
                particle.remove();
            }, 20000);
        };

        // Create particles periodically
        const interval = setInterval(() => {
            createParticle();
        }, 300);

        // Initial particles
        for (let i = 0; i < 20; i++) {
            createParticle();
        }

        return () => {
            clearInterval(interval);
        };
    }, []);

    return <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
}
