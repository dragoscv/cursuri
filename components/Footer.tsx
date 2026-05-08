'use client';

import React from 'react';
import Link from 'next/link';
import { AppContext } from './AppContext';
import { AppContextProps } from '@/types';
import { useTranslations } from 'next-intl';
import GithubIcon from './icons/GithubIcon';
import TikTokIcon from './icons/TikTokIcon';
import WebsiteIcon from './icons/WebsiteIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import packageInfo from '../package.json';
import Button from './ui/Button';
import { legalConfig } from '@/config/legal';

const Footer = React.memo(function Footer() {
  const t = useTranslations('common');
  const context = React.useContext(AppContext) as AppContextProps;
  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }
  const { isDark, toggleTheme } = context;

  const year = new Date().getFullYear();
  const appVersion = packageInfo.version;

  return (
    <footer
      className="bg-[color:var(--ai-background)] dark:bg-[color:var(--ai-background)] border-t border-[color:var(--ai-card-border)]"
      role="contentinfo"
      aria-label={t('accessibility.footerNavigation')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left column - About */}
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
              StudiAI
            </h3>
            <p className="text-[color:var(--ai-muted)] mb-4">{t('footer.about')}</p>
            <p className="text-sm text-[color:var(--ai-muted)]">
              {t('footer.version')} {appVersion}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
              {t('footer.quickLinks')}
            </h3>
            <nav aria-label={t('footer.quickLinks')}>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/courses"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('nav.allCourses')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#featured"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('nav.featuredCourses')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#testimonials"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('nav.testimonials')}
                  </Link>
                </li>
                <li>
                  <Button
                    onPress={toggleTheme}
                    variant="light"
                    aria-label={t('accessibility.toggleTheme')}
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] p-0 min-w-0"
                  >
                    {isDark ? t('theme.dark') : t('theme.light')}
                  </Button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
              {t('footer.legal')}
            </h3>
            <nav aria-label={t('footer.legal')}>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms-conditions"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.termsConditions')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gdpr"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.gdpr')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.cookiePolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.refundPolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal-notice"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.legalNotice')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dsa"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.dsa')}
                  </Link>
                </li>
                <li className="pt-2 mt-2 border-t border-[color:var(--ai-card-border)]/40">
                  <a
                    href={legalConfig.anpcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.anpc')}
                  </a>
                </li>
                <li>
                  <a
                    href={legalConfig.odrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition"
                  >
                    {t('footer.odr')}
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
              {t('footer.connect')}
            </h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://github.com/dragoscv"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="text-[color:var(--ai-primary)]" size={24} />
              </a>
              <a
                href="https://discord.gg/SbqrU73MjB"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="text-[color:var(--ai-primary)]" size={24} />
              </a>
              <a
                href="https://www.tiktok.com/@mantreb"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="text-[color:var(--ai-primary)]" size={24} />
              </a>
              <a
                href="https://dragoscatalin.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                aria-label="Website"
              >
                <WebsiteIcon className="text-[color:var(--ai-primary)]" size={24} />
              </a>
            </div>
            <p className="text-[color:var(--ai-muted)]">
              {t('footer.contactEmail')}{' '}
              <a
                href={`mailto:${legalConfig.contactEmail}`}
                className="text-[color:var(--ai-primary)] hover:underline"
              >
                {legalConfig.contactEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[color:var(--ai-card-border)] space-y-2">
          <p className="text-center text-[color:var(--ai-muted)] text-sm">
            &copy; {year} {legalConfig.brandName}. {t('footer.copyright')}
          </p>
          <p className="text-center text-[color:var(--ai-muted)] text-xs">
            {t('footer.operatedBy', {
              operator: legalConfig.operatorName,
              status: legalConfig.operatorStatus,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
