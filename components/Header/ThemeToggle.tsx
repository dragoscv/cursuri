'use client';

import React, { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Theme toggle — animated sun/moon swap with rotation + crossfade.
 */
export default function ThemeToggle() {
  const t = useTranslations('common');
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('Missing context value');
  }

  const { isDark, toggleTheme } = context;

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={t('accessibility.toggleTheme')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="relative w-9 h-9 grid place-items-center rounded-full text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/10 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
