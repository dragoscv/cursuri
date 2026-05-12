'use client';

/**
 * LanguageSwitcher v2 — single segmented EN/RO toggle. One pill with two
 * sliding states instead of two competing buttons. Cookie-based, full
 * page reload (next-intl pulls translations from messages/{locale}/*).
 */

import React, { memo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const LOCALES = ['en', 'ro'] as const;
type Locale = (typeof LOCALES)[number];

const LanguageSwitcher = memo(function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const t = useTranslations('common.accessibility');

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.href = window.location.pathname + window.location.search;
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="relative inline-flex items-center h-8 p-0.5 rounded-md bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)]"
    >
      {LOCALES.map((locale) => {
        const active = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchLanguage(locale)}
            aria-label={t('toggleLanguage').replace(
              '{language}',
              locale === 'en' ? 'English' : 'Romanian'
            )}
            aria-current={active ? 'true' : undefined}
            className={`relative z-10 px-2.5 h-7 text-[11px] font-semibold tracking-[0.05em] uppercase rounded-[5px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)] cursor-pointer ${
              active
                ? 'text-[color:var(--ai-foreground)]'
                : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
            }`}
          >
            {active ? (
              <motion.span
                layoutId="lang-switch-pill"
                aria-hidden
                className="absolute inset-0 rounded-[5px] bg-[color:var(--ai-background)] shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{locale}</span>
          </button>
        );
      })}
    </div>
  );
});

export default LanguageSwitcher;
