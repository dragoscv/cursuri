'use client';

/**
 * Footer — Cinematic v0.5.
 * Gold-rim divider as the opening line, 4-column with eyebrow labels,
 * status orb (live), legal block preserving every Romanian compliance link
 * (ANPC, ODR, GDPR, DSA), connect block with subtle hover glow.
 */

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AppContext } from './AppContext';
import { AppContextProps } from '@/types';
import GithubIcon from './icons/GithubIcon';
import TikTokIcon from './icons/TikTokIcon';
import WebsiteIcon from './icons/WebsiteIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import packageInfo from '../package.json';
import Button from './ui/Button';
import { legalConfig } from '@/config/legal';

type LinkItem = { href: string; label: string; external?: boolean };

const Footer = React.memo(function Footer() {
  const t = useTranslations('common');
  const context = React.useContext(AppContext) as AppContextProps;
  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }
  const { isDark, toggleTheme } = context;

  const year = new Date().getFullYear();
  const appVersion = packageInfo.version;

  const quickLinks: LinkItem[] = [
    { href: '/courses', label: t('nav.allCourses') },
    { href: '/#featured', label: t('nav.featuredCourses') },
    { href: '/#testimonials', label: t('nav.testimonials') },
  ];

  const legalLinks: LinkItem[] = [
    { href: '/terms-conditions', label: t('footer.termsConditions') },
    { href: '/privacy-policy', label: t('footer.privacyPolicy') },
    { href: '/gdpr', label: t('footer.gdpr') },
    { href: '/cookie-policy', label: t('footer.cookiePolicy') },
    { href: '/refund-policy', label: t('footer.refundPolicy') },
    { href: '/legal-notice', label: t('footer.legalNotice') },
    { href: '/dsa', label: t('footer.dsa') },
  ];

  const externalLegal: LinkItem[] = [
    { href: legalConfig.anpcUrl, label: t('footer.anpc'), external: true },
    { href: legalConfig.odrUrl, label: t('footer.odr'), external: true },
  ];

  return (
    <footer
      className="relative bg-[color:var(--ai-background)] overflow-hidden"
      role="contentinfo"
      aria-label={t('accessibility.footerNavigation')}
    >
      {/* Gold-rim divider — opens the footer like the closing credits */}
      <div aria-hidden className="cinematic-rim-divider" />

      {/* Subtle radial glow centered above the rim line */}
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-64 rounded-full bg-gradient-to-b from-amber-400/8 via-amber-400/4 to-transparent blur-3xl pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 gap-y-12">
          {/* === Brand === */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 orb-breath" />
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-400">
                {t('footer.statusLive')}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-3">StudiAI</h3>
            <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed mb-4">
              {t('footer.about')}
            </p>
            <p className="text-[11px] font-mono text-[color:var(--ai-muted)]/70">
              v{appVersion} · {t('footer.version')}
            </p>
          </div>

          {/* === Quick Links === */}
          <div>
            <FooterEyebrow>{t('footer.quickLinks')}</FooterEyebrow>
            <nav aria-label={t('footer.quickLinks')}>
              <ul className="space-y-2.5">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
                <li>
                  <Button
                    onPress={toggleTheme}
                    variant="light"
                    aria-label={t('accessibility.toggleTheme')}
                    className="text-sm text-[color:var(--ai-muted)] hover:text-amber-500 p-0 min-w-0 h-auto bg-transparent"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500/40" />
                      {isDark ? t('theme.dark') : t('theme.light')}
                    </span>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>

          {/* === Legal === */}
          <div>
            <FooterEyebrow>{t('footer.legal')}</FooterEyebrow>
            <nav aria-label={t('footer.legal')}>
              <ul className="space-y-2.5">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/5">
                <ul className="space-y-2.5">
                  {externalLegal.map((l) => (
                    <li key={l.href}>
                      <FooterLink href={l.href} external>
                        {l.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          {/* === Connect === */}
          <div>
            <FooterEyebrow>{t('footer.connect')}</FooterEyebrow>
            <div className="flex gap-2 mb-5">
              <SocialButton href="https://github.com/dragoscv" label="GitHub">
                <GithubIcon size={20} />
              </SocialButton>
              <SocialButton href="https://discord.gg/SbqrU73MjB" label="Discord">
                <DiscordIcon size={20} />
              </SocialButton>
              <SocialButton href="https://www.tiktok.com/@mantreb" label="TikTok">
                <TikTokIcon size={20} />
              </SocialButton>
              <SocialButton href="https://dragoscatalin.ro" label="Website">
                <WebsiteIcon size={20} />
              </SocialButton>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-[color:var(--ai-muted)] mb-1">
                {t('footer.contactEmail')}
              </p>
              <a
                href={`mailto:${legalConfig.contactEmail}`}
                className="text-sm text-[color:var(--ai-foreground)] hover:text-amber-500 transition-colors break-all"
              >
                {legalConfig.contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Closing strip */}
        <div className="mt-14 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <p className="text-[12px] text-[color:var(--ai-muted)]">
              &copy; {year} {legalConfig.brandName}. {t('footer.copyright')}
            </p>
            <p className="text-[11px] text-[color:var(--ai-muted)]/70">
              {t('footer.operatedBy', {
                operator: legalConfig.operatorName,
                status: legalConfig.operatorStatus,
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

/* ------- Primitives ------- */

function FooterEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[color:var(--ai-muted)] mb-4">
      {children}
    </h3>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    'group inline-flex items-center gap-2 text-sm text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] transition-colors';
  const dot = (
    <span
      aria-hidden
      className="h-1 w-1 rounded-full bg-[color:var(--ai-primary)]/0 group-hover:bg-[color:var(--ai-primary)] transition-colors"
    />
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {dot}
        <span>{children}</span>
        <span
          aria-hidden
          className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity"
        >
          ↗
        </span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {dot}
      <span>{children}</span>
    </Link>
  );
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] hover:border-[color:var(--ai-primary)]/40 hover:bg-[color:var(--ai-primary)]/8 transition-all"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: '0 0 24px -6px rgba(var(--ai-primary-rgb), 0.45)',
        }}
      />
      <span className="relative">{children}</span>
    </a>
  );
}

export default Footer;
