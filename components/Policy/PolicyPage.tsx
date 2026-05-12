'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface PolicyPageProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

const POLICY_LINKS: { href: string; key: string }[] = [
  { href: '/terms-conditions', key: 'termsConditions' },
  { href: '/privacy-policy', key: 'privacyPolicy' },
  { href: '/gdpr', key: 'gdprPolicy' },
  { href: '/cookie-policy', key: 'cookiePolicy' },
  { href: '/refund-policy', key: 'refundPolicy' },
  { href: '/legal-notice', key: 'legalNotice' },
  { href: '/dsa', key: 'dsa' },
];

export default function PolicyPage({ title, lastUpdated, children }: PolicyPageProps) {
  const t = useTranslations('common');

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <header className="mb-10 sm:mb-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-8 bg-amber-500" aria-hidden />
          <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent text-[10px] uppercase tracking-[0.18em] font-semibold">
            {t('policyEyebrow')}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-[color:var(--ai-foreground)] leading-[1.1]">
          {title}
        </h1>

        {lastUpdated && (
          <p className="mt-5 text-sm text-[color:var(--ai-muted)] tabular-nums">
            {t('lastUpdated', { date: lastUpdated })}
          </p>
        )}
      </header>

      <article
        className="
                    prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:tracking-[-0.01em]
                    prose-headings:text-[color:var(--ai-foreground)]
                    prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4
                    prose-h2:pl-4 prose-h2:border-l-[3px] prose-h2:border-l-amber-500
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-[color:var(--ai-muted)] prose-p:leading-relaxed
                    prose-li:text-[color:var(--ai-muted)] prose-li:leading-relaxed
                    prose-strong:text-[color:var(--ai-foreground)]
                    prose-a:text-[color:var(--ai-foreground)] prose-a:underline prose-a:decoration-amber-500/60 prose-a:underline-offset-4 hover:prose-a:decoration-amber-500
                "
      >
        {children}
      </article>

      <nav
        aria-label={t('policyEyebrow')}
        className="mt-16 pt-10 border-t border-[color:var(--ai-card-border)]"
      >
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[color:var(--ai-muted)] mb-5">
          {t('relatedLegal')}
        </p>
        <ul className="flex flex-wrap gap-2">
          {POLICY_LINKS.map(({ href, key }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex items-center h-8 px-3 rounded-full text-xs font-medium border border-[color:var(--ai-card-border)] text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-foreground)]/40 transition-colors duration-200"
              >
                {t(`policyLinks.${key}`)}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="inline-flex items-center h-8 px-3 rounded-full text-xs font-medium bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity duration-200"
            >
              {t('policyLinks.backToHome')}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
