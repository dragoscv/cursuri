'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { fadeUp, cosmic } from './presets';

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  /** y-offset before reveal, default 24 */
  offset?: number;
  /** trigger once on viewport entry (true) or on mount (false). Default: 'mount' */
  trigger?: 'mount' | 'view';
};

/**
 * Reveal — primitive entrance for any element. Respects prefers-reduced-motion.
 */
export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { children, delay = 0, offset = 24, trigger = 'mount', ...rest },
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

  const variants =
    offset === 24 && delay === 0
      ? fadeUp
      : {
          hidden: { opacity: 0, y: offset },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: cosmic, delay },
          },
        };

  const triggerProps =
    trigger === 'view'
      ? { whileInView: 'visible', viewport: { once: true, margin: '-80px' } }
      : { animate: 'visible' };

  return (
    <motion.div ref={ref} initial="hidden" variants={variants} {...triggerProps} {...rest}>
      {children}
    </motion.div>
  );
});
