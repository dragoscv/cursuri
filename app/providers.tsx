'use client';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@/components/Toast/ToastContext';
import { SimpleProviders } from '@/components/contexts/SimpleProviders';
import SecurityInitializer from '@/components/SecurityInitializer';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';
import AppLoader from '@/components/ui/AppLoader';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, Record<string, string>> | null>(null);
  const [locale, setLocale] = useState<string>('ro');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get locale from cookie
    const cookieLocale =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('locale='))
        ?.split('=')[1] || 'ro';

    const validLocale = cookieLocale === 'en' ? 'en' : 'ro';
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
      'payment',
      'subscription',
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
          'payment',
          'subscription',
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
    return <AppLoader locale={locale} />;
  }

  return (
    <>
      {isLoading && <AppLoader onLoadingComplete={() => setIsLoading(false)} locale={locale} />}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <HeroUIProvider>
          <ToastProvider>
            <SimpleProviders>
              <SecurityInitializer>{children}</SecurityInitializer>
            </SimpleProviders>
          </ToastProvider>
        </HeroUIProvider>
      </NextIntlClientProvider>
    </>
  );
}
