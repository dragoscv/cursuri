'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@heroui/react';

/**
 * LanguageSwitcher component for instant language switching
 * Uses cookies to store language preference without changing URL
 */
const LanguageSwitcher = React.memo(function LanguageSwitcher() {
  const currentLocale = useLocale();
  const t = useTranslations('common.accessibility');

  const switchLanguage = async (newLocale: 'en' | 'ro') => {
    // Set cookie for locale preference
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Reload page to apply new locale
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={currentLocale === 'en' ? 'solid' : 'light'}
        onClick={() => switchLanguage('en')}
        className={`
          font-medium text-xs px-3 py-1 min-w-[45px] rounded-full
          ${
            currentLocale === 'en'
              ? 'bg-[color:var(--ai-primary)] text-white'
              : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
          }
        `}
        aria-label={t('toggleLanguage').replace('{language}', 'English')}
        aria-current={currentLocale === 'en' ? 'true' : undefined}
      >
        EN
      </Button>
      <Button
        size="sm"
        variant={currentLocale === 'ro' ? 'solid' : 'light'}
        onClick={() => switchLanguage('ro')}
        className={`
          font-medium text-xs px-3 py-1 min-w-[45px] rounded-full
          ${
            currentLocale === 'ro'
              ? 'bg-[color:var(--ai-primary)] text-white'
              : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
          }
        `}
        aria-label={t('toggleLanguage').replace('{language}', 'Romanian')}
        aria-current={currentLocale === 'ro' ? 'true' : undefined}
      >
        RO
      </Button>
    </div>
  );
});

export default LanguageSwitcher;
