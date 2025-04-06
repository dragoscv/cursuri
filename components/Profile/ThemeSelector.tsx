'use client'

import React from 'react';
import { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import Button from '@/components/ui/Button';
import { ColorScheme } from '@/types';
import { FiCheck } from '@/components/icons/FeatherIcons';

interface ThemeSelectorProps {
    onThemeChange?: (theme: ColorScheme) => void;
}

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { colorScheme, setColorScheme, isDark, toggleTheme } = context;

    const themeOptions: { name: string; value: ColorScheme; lightColor: string; darkColor: string }[] = [
        {
            name: 'Black and White',
            value: 'black-white',
            lightColor: '#000000',
            darkColor: '#ffffff'
        },
        {
            name: 'Modern Purple',
            value: 'modern-purple',
            lightColor: '#6366f1',
            darkColor: '#818cf8'
        },
        {
            name: 'Green Neon',
            value: 'green-neon',
            lightColor: '#10b981',
            darkColor: '#4ade80'
        },
        {
            name: 'Blue Ocean',
            value: 'blue-ocean',
            lightColor: '#0ea5e9',
            darkColor: '#38bdf8'
        },
        {
            name: 'Brown Sunset',
            value: 'brown-sunset',
            lightColor: '#b45309',
            darkColor: '#f59e0b'
        },
        {
            name: 'Yellow Morning',
            value: 'yellow-morning',
            lightColor: '#eab308',
            darkColor: '#facc15'
        },
        {
            name: 'Red Blood',
            value: 'red-blood',
            lightColor: '#dc2626',
            darkColor: '#ef4444'
        },
        {
            name: 'Pink Candy',
            value: 'pink-candy',
            lightColor: '#db2777',
            darkColor: '#ec4899'
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
                    Light/Dark Mode
                </h3>
                <Button
                    variant="flat"
                    color={isDark ? "secondary" : "primary"}
                    className={`min-w-[120px] themed-button-${isDark ? 'secondary' : 'primary'}`}
                    onClick={toggleTheme}
                >
                    {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </Button>
            </div>

            <div className="mb-6">
                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] mb-3">
                    Color Scheme
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {themeOptions.map((theme) => (
                        <div
                            key={theme.value}
                            onClick={() => handleThemeChange(theme.value)}
                            className={`
                relative cursor-pointer rounded-md p-3 border-2 
                transition-all duration-300 hover:shadow-md
                ${colorScheme === theme.value
                                    ? 'border-[color:var(--ai-primary)] shadow-sm'
                                    : 'border-[color:var(--ai-card-border)]'
                                }
              `}
                        >
                            <div className="flex flex-col items-center">
                                <div className="flex w-full rounded-md overflow-hidden h-12 mb-2">
                                    <div
                                        className="w-1/2 h-full"
                                        style={{ backgroundColor: theme.lightColor }}
                                    />
                                    <div
                                        className="w-1/2 h-full"
                                        style={{ backgroundColor: theme.darkColor }}
                                    />
                                </div>
                                <span className="text-sm text-[color:var(--ai-foreground)] text-center">
                                    {theme.name}
                                </span>

                                {colorScheme === theme.value && (
                                    <div className="absolute top-2 right-2 bg-[color:var(--ai-primary)] text-white rounded-full p-1">
                                        <FiCheck size={12} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}