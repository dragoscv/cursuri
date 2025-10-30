'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

/**
 * LanguageSwitcher component for instant language switching
 * Uses cookies to store language preference without changing URL
 */
const LanguageSwitcher = React.memo(function LanguageSwitcher() {
  const currentLocale = useLocale();
  const t = useTranslations('common.accessibility');
  const router = useRouter();

  const switchLanguage = async (newLocale: 'en' | 'ro') => {
    // Set cookie for locale preference
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Navigate to current path to trigger re-render with new locale
    // This is smoother than window.location.reload() as it uses client-side navigation
    window.location.href = window.location.pathname + window.location.search;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={currentLocale === 'en' ? 'solid' : 'light'}
        onClick={() => switchLanguage('en')}
        className={`
          font-medium text-xs px-3 py-1 min-w-[45px] rounded-full
          ${currentLocale === 'en'
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
          ${currentLocale === 'ro'
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
