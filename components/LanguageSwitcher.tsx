'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@heroui/react';

/**
 * LanguageSwitcher component for instant language switching
 * Uses cookies to store language preference without changing URL
 */
export default function LanguageSwitcher() {
    const currentLocale = useLocale();

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
          font-medium text-xs px-3 py-1 min-w-[45px]
          ${currentLocale === 'en'
                        ? 'bg-[color:var(--ai-primary)] text-white'
                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                    }
        `}
                aria-label="Switch to English"
            >
                EN
            </Button>
            <Button
                size="sm"
                variant={currentLocale === 'ro' ? 'solid' : 'light'}
                onClick={() => switchLanguage('ro')}
                className={`
          font-medium text-xs px-3 py-1 min-w-[45px]
          ${currentLocale === 'ro'
                        ? 'bg-[color:var(--ai-primary)] text-white'
                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                    }
        `}
                aria-label="Switch to Romanian"
            >
                RO
            </Button>
        </div>
    );
}
