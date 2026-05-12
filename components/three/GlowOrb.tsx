'use client';

/**
 * GlowOrb2D — SVG-rendered emissive orb with breathing animation.
 * Three of these placed at calibrated thirds simulate a 3-point cinematic lighting.
 */

import { motion, useReducedMotion } from 'framer-motion';

type GlowOrb2DProps = {
  /** CSS positioning: tailwind classes for absolute placement */
  className?: string;
  /** Diameter in px */
  size?: number;
  /** Core color (any CSS color) */
  color?: string;
  /** Halo color (defaults to color) */
  haloColor?: string;
  /** Breathing duration in seconds */
  duration?: number;
  /** Phase offset in seconds (negative starts mid-breath) */
  delay?: number;
};

export function GlowOrb2D({
  className = '',
  size = 280,
  color = '#818cf8',
  haloColor,
  duration = 4.8,
  delay = 0,
}: GlowOrb2DProps) {
  const prefersReduced = useReducedMotion();
  const halo = haloColor || color;

  const animateProps = prefersReduced
    ? undefined
    : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] };

  return (
    <motion.div
      aria-hidden
      className={`absolute pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      animate={animateProps}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 28px ${halo}aa)` }}
      >
        <defs>
          <radialGradient
            id={`orb-grad-${color.replace(/[^a-z0-9]/gi, '')}`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="40%" stopColor={color} stopOpacity="0.6" />
            <stop offset="70%" stopColor={halo} stopOpacity="0.25" />
            <stop offset="100%" stopColor={halo} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="50"
          fill={`url(#orb-grad-${color.replace(/[^a-z0-9]/gi, '')})`}
        />
        <circle cx="50" cy="50" r="12" fill={color} opacity="0.85" />
      </svg>
    </motion.div>
  );
}
