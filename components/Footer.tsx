'use client';

import React from 'react';
import Link from 'next/link';
import { AppContext } from './AppContext';
import { AppContextProps } from '@/types';
import { useTranslations } from 'next-intl';
import GithubIcon from './icons/GithubIcon';
import TikTokIcon from './icons/TikTokIcon';
import WebsiteIcon from './icons/WebsiteIcon';
import packageInfo from '../package.json';
import Button from './ui/Button';

const Footer = () => {
    const t = useTranslations('common');
    const context = React.useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { isDark, toggleTheme } = context;

    const year = new Date().getFullYear();
    const appVersion = packageInfo.version;

    return (
        <footer className="bg-[color:var(--ai-background)] dark:bg-[color:var(--ai-background)] border-t border-[color:var(--ai-card-border)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left column - About */}
                    <div>
                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">Cursuri</h3>
                        <p className="text-[color:var(--ai-muted)] mb-4">
                            {t('footer.about')}
                        </p>
                        <p className="text-sm text-[color:var(--ai-muted)]">
                            {t('footer.version')} {appVersion}
                        </p>
                    </div>

                    {/* Middle column - Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">{t('footer.quickLinks')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/courses" className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition">
                                    {t('nav.allCourses')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/#featured" className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition">
                                    {t('nav.featuredCourses')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/#testimonials" className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition">
                                    {t('nav.testimonials')}
                                </Link>
                            </li>
                            <li>
                                <Button
                                    onPress={toggleTheme}
                                    variant="light"
                                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] p-0 min-w-0"
                                >
                                    {isDark ? t('theme.dark') : t('theme.light')}
                                </Button>
                            </li>
                        </ul>
                    </div>

                    {/* Right column - Connect */}
                    <div>
                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">{t('footer.connect')}</h3>
                        <div className="flex space-x-4 mb-4">
                            <a
                                href="https://github.com/catalinpetrovici"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                                aria-label="GitHub"
                            >
                                <GithubIcon className="text-[color:var(--ai-primary)]" size={24} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@catalinpetrovici"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                                aria-label="TikTok"
                            >
                                <TikTokIcon className="text-[color:var(--ai-primary)]" size={24} />
                            </a>
                            <a
                                href="https://catalinpetrovici.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[color:var(--ai-card-border)]/30 dark:hover:bg-[color:var(--ai-card-border)]/20 transition-colors"
                                aria-label="Website"
                            >
                                <WebsiteIcon className="text-[color:var(--ai-primary)]" size={24} />
                            </a>
                        </div>
                        <p className="text-[color:var(--ai-muted)]">
                            {t('footer.contactEmail')} <a href="mailto:contact@cursuri.dev" className="text-[color:var(--ai-primary)] hover:underline">contact@cursuri.dev</a>
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[color:var(--ai-card-border)]">
                    <p className="text-center text-[color:var(--ai-muted)] text-sm">
                        &copy; {year} Cursuri. {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;