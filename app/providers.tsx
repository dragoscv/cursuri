'use client';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@/components/Toast/ToastContext';
import { SimpleProviders } from '@/components/contexts/SimpleProviders';
import SecurityInitializer from '@/components/SecurityInitializer';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';

const TRANSLATION_DOMAINS = [
  'common',
  'auth',
  'courses',
  'lessons',
  'profile',
  'admin',
  'home',
  'legal',
  'about',
  'contact',
  'payment',
  'subscription',
  'meetings',
  'onboarding',
] as const;

function MinimalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgb(var(--background-start-rgb))]">
      <div className="w-8 h-8 border-2 border-[color:var(--ai-primary)]/30 border-t-[color:var(--ai-primary)] rounded-full animate-spin" />
    </div>
  );
}

function loadTranslations(locale: string) {
  return Promise.all(
    TRANSLATION_DOMAINS.map((domain) =>
      import(`../messages/${locale}/${domain}.json`)
        .then((m) => ({ domain, messages: m.default }))
        .catch(() => ({ domain, messages: {} }))
    )
  ).then((results) => {
    const merged: Record<string, Record<string, string>> = {};
    results.forEach(({ domain, messages: domainMessages }) => {
      merged[domain] = domainMessages;
    });
    return merged;
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, Record<string, string>> | null>(null);
  const [locale, setLocale] = useState<string>('ro');

  useEffect(() => {
    const cookieLocale =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('locale='))
        ?.split('=')[1] || 'ro';

    const validLocale = cookieLocale === 'en' ? 'en' : 'ro';
    setLocale(validLocale);

    loadTranslations(validLocale)
      .catch(() => loadTranslations('en'))
      .then(setMessages);
  }, []);

  if (!messages) {
    return <MinimalLoader />;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HeroUIProvider>
        <ToastProvider>
          <SimpleProviders>
            <SecurityInitializer>{children}</SecurityInitializer>
          </SimpleProviders>
        </ToastProvider>
      </HeroUIProvider>
    </NextIntlClientProvider>
  );
}
