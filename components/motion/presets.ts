// Shared motion presets for the cinematic redesign.
// Keep these in ONE place so every entrance feels like the same film.
import type { Variants, Transition } from 'framer-motion';

// Easings — tuned for cinema, not Material Design
export const cosmic = [0.22, 1, 0.36, 1] as const;
export const mystic = [0.16, 1, 0.3, 1] as const;
export const drift = [0.4, 0, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: cosmic },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: cosmic } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: cosmic } },
};

export const stagger = (gap = 0.08, delay = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

// Hero choreography — 3-act mini-film
// Act I: atmosphere fades in (0-400ms)
// Act II: subject scales in (300-900ms)
// Act III: UI staggers in (700-1400ms)
export const heroOverture: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

// Ambient orb breathing (use as `animate` on a motion element)
export const orbBreath: Transition = {
  duration: 4.8,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatType: 'mirror',
};
