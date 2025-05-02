'use client'

import React, { useEffect, useRef } from 'react';

export default function ParticlesAnimation() {
  const particlesRef = useRef<HTMLDivElement>(null);

  // Create floating particles animation
  useEffect(() => {
    if (!particlesRef.current) return;

    // Create animation style only once, with fixed values to avoid excessive DOM changes
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
              transform: translateY(-200px) scale(0.8);
              opacity: 0.2;
            }
            100% {
              transform: translateY(-250px) scale(0);
              opacity: 0;
            }
          }
        `;
      document.head.appendChild(style);
    }

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

      // Add to the DOM
      particlesRef.current?.appendChild(particle);

      // Remove after animation
      setTimeout(() => {
        particle.remove();
      }, 20000);
    };        // Create particles periodically, but limit to fewer particles
    const interval = setInterval(() => {
      // Limit the total number of particles to avoid performance issues
      const maxParticles = 30;
      if (particlesRef.current && particlesRef.current.childElementCount < maxParticles) {
        createParticle();
      }
    }, 800);

    // Initial particles - reduce number from 20 to 10
    for (let i = 0; i < 8; i++) {
      createParticle();
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
}
