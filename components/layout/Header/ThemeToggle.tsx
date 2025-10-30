'use client'

import React, { useContext } from 'react';
import Button from '@/components/ui/Button';
import { AppContext } from '@/components/AppContext';

/**
 * Theme toggle component for the header
 * Displays a sun/moon icon and toggles between light and dark mode
 */
export default function ThemeToggle() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("Missing context value");
    }

    const { isDark, toggleTheme } = context;

    return (
        <Button
            isIconOnly
            variant="ghost"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition-colors"
            onClick={toggleTheme}
        >
            {isDark ? (
                // Sun icon for light mode
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ) : (
                // Moon icon for dark mode
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            )}
        </Button>
    );
}