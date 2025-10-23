'use client';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@/components/Toast/ToastContext';
import { SimpleProviders } from '@/components/contexts/SimpleProviders';
import SecurityInitializer from '@/components/SecurityInitializer';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, Record<string, string>> | null>(null);
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    // Get locale from cookie
    const cookieLocale =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('locale='))
        ?.split('=')[1] || 'en';

    const validLocale = cookieLocale === 'ro' ? 'ro' : 'en';
    setLocale(validLocale);

    // Load all domain translation files and merge them
    const domains = [
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
    ];
    Promise.all(
      domains.map((domain) =>
        import(`../messages/${validLocale}/${domain}.json`)
          .then((m) => ({ domain, messages: m.default }))
          .catch(() => ({ domain, messages: {} }))
      )
    )
      .then((results) => {
        const mergedMessages: Record<string, Record<string, string>> = {};
        results.forEach(({ domain, messages: domainMessages }) => {
          mergedMessages[domain] = domainMessages;
        });
        setMessages(mergedMessages);
      })
      .catch(() => {
        // Fallback to English if loading fails
        const fallbackDomains = [
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
        ];
        Promise.all(
          fallbackDomains.map((domain) =>
            import(`../messages/en/${domain}.json`)
              .then((m) => ({ domain, messages: m.default }))
              .catch(() => ({ domain, messages: {} }))
          )
        ).then((results) => {
          const mergedMessages: Record<string, Record<string, string>> = {};
          results.forEach(({ domain, messages: domainMessages }) => {
            mergedMessages[domain] = domainMessages;
          });
          setMessages(mergedMessages);
        });
      });
  }, []);

  if (!messages) {
    return <div>Loading...</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SimpleProviders>
        <SecurityInitializer>
          <HeroUIProvider>
            <ToastProvider>{children}</ToastProvider>
          </HeroUIProvider>
        </SecurityInitializer>
      </SimpleProviders>
    </NextIntlClientProvider>
  );
}
