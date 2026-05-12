'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { stagger } from './presets';

type StaggerProps = HTMLMotionProps<'div'> & {
  /** seconds between children */
  gap?: number;
  /** seconds before first child */
  delay?: number;
  trigger?: 'mount' | 'view';
};

/**
 * Stagger — wraps a group whose children animate in sequence.
 * Children should use the same variants object (or rely on inherited `hidden`/`visible` states).
 */
export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(function Stagger(
  { children, gap = 0.08, delay = 0.08, trigger = 'mount', ...rest },
  ref
) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div ref={ref} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children as React.ReactNode}
      </div>
    );
  }

  const triggerProps =
    trigger === 'view'
      ? { whileInView: 'visible', viewport: { once: true, margin: '-80px' } }
      : { animate: 'visible' };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      variants={stagger(gap, delay)}
      {...triggerProps}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
