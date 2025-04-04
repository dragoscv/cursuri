'use client';

import React from 'react';
import Link from 'next/link';
import { AppContext } from './AppContext';
import { AppContextProps } from '@/types';
import GithubIcon from './icons/GithubIcon';
import TikTokIcon from './icons/TikTokIcon';
import WebsiteIcon from './icons/WebsiteIcon';
import packageInfo from '../package.json';

const Footer = () => {
    const context = React.useContext(AppContext) as AppContextProps;
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { isDark, toggleTheme } = context;

    const year = new Date().getFullYear();
    const appVersion = packageInfo.version;

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left column - About */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cursuri</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Quality programming courses to help you master modern web and mobile development.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Version {appVersion}
                        </p>
                    </div>

                    {/* Middle column - Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/courses" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    All Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/#featured" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    Featured Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    Testimonials
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={toggleTheme}
                                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                >
                                    {isDark ? 'Light Mode' : 'Dark Mode'}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Right column - Connect */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
                        <div className="flex space-x-4 mb-4">
                            <a
                                href="https://github.com/catalinpetrovici"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                aria-label="GitHub"
                            >
                                <GithubIcon className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.tiktok.com/@catalinpetrovici"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                aria-label="TikTok"
                            >
                                <TikTokIcon className="w-6 h-6" />
                            </a>
                            <a
                                href="https://catalinpetrovici.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                aria-label="Website"
                            >
                                <WebsiteIcon className="w-6 h-6" />
                            </a>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Contact us at <a href="mailto:contact@cursuri.dev" className="text-indigo-600 dark:text-indigo-400 hover:underline">contact@cursuri.dev</a>
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        &copy; {year} Cursuri. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;