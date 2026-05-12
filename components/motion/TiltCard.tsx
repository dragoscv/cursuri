'use client';

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees, default 8 */
  maxTilt?: number;
  /** intensity of the highlight overlay, 0-1 */
  glare?: number;
};

/**
 * TiltCard — pointer-driven 3D tilt with a soft directional highlight.
 * Tactile, but always falls back to a flat card under reduced motion.
 */
export function TiltCard({ children, className = '', maxTilt = 8, glare = 0.35 }: TiltCardProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0); // -1..1
  const y = useMotionValue(0); // -1..1

  const rotateX = useSpring(useTransform(y, [-1, 1], [maxTilt, -maxTilt]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-1, 1], [-maxTilt, maxTilt]), {
    stiffness: 220,
    damping: 22,
  });

  const highlightX = useTransform(x, [-1, 1], ['0%', '100%']);
  const highlightY = useTransform(y, [-1, 1], ['0%', '100%']);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={`relative will-change-transform ${className}`}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        x.set(px * 2 - 1);
        y.set(py * 2 - 1);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
        style={{
          opacity: glare,
          background: `radial-gradient(60% 60% at ${highlightX as unknown as string} ${
            highlightY as unknown as string
          }, rgba(255,255,255,0.5), transparent 60%)`,
        }}
      />
    </motion.div>
  );
}
