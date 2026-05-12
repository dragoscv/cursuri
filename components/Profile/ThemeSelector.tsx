'use client';

import React from 'react';
import { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { ColorScheme } from '@/types';
import { FiCheck } from '@/components/icons/FeatherIcons';

interface ThemeSelectorProps {
  onThemeChange?: (theme: ColorScheme) => void;
}

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const context = useContext(AppContext);
  const t = useTranslations('profile.themes');

  if (!context) {
    throw new Error('AppContext not found');
  }

  const { colorScheme, setColorScheme, isDark, toggleTheme } = context;

  const themeOptions: {
    name: string;
    value: ColorScheme;
    description: string;
    lightColor: string;
    darkColor: string;
  }[] = [
    {
      name: t('cinematic'),
      value: 'cinematic',
      description: t('cinematicDescription'),
      lightColor: '#6366f1',
      darkColor: '#818cf8',
    },
    {
      name: t('ivory'),
      value: 'ivory',
      description: t('ivoryDescription'),
      lightColor: '#b45309',
      darkColor: '#f59e0b',
    },
    {
      name: t('terminal'),
      value: 'terminal',
      description: t('terminalDescription'),
      lightColor: '#059669',
      darkColor: '#34d399',
    },
  ];

  const handleThemeChange = (theme: ColorScheme) => {
    setColorScheme(theme);
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-[color:var(--ai-foreground)]">
          {t('lightDarkMode')}
        </h3>
        <Button
          variant="flat"
          color={isDark ? 'secondary' : 'primary'}
          radius="lg"
          className={`min-w-[120px] rounded-xl themed-button-${isDark ? 'secondary' : 'primary'}`}
          onClick={toggleTheme}
        >
          {isDark ? `☀️ ${t('lightMode')}` : `🌙 ${t('darkMode')}`}
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-medium text-[color:var(--ai-foreground)] mb-3">
          {t('colorScheme')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => handleThemeChange(theme.value)}
              className={`relative text-left rounded-xl p-4 border transition-all duration-300 hover:shadow-md ${
                colorScheme === theme.value
                  ? 'border-[color:var(--ai-primary)] shadow-sm'
                  : 'border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40'
              }`}
              aria-pressed={colorScheme === theme.value}
            >
              <div className="flex w-full rounded-md overflow-hidden h-14 mb-3">
                <div className="w-1/2 h-full" style={{ backgroundColor: theme.lightColor }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: theme.darkColor }} />
              </div>
              <p className="text-sm font-semibold text-[color:var(--ai-foreground)]">
                {theme.name}
              </p>
              <p className="text-xs text-[color:var(--ai-muted)] mt-0.5">{theme.description}</p>
              {colorScheme === theme.value && (
                <div className="absolute top-2 right-2 bg-[color:var(--ai-primary)] text-white rounded-full p-1">
                  <FiCheck size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
