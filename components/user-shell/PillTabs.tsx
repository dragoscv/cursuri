'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PillTab {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    /** Optional badge count shown on the right of the label */
    badge?: number | string;
}

interface PillTabsProps {
    tabs: PillTab[];
    active: string;
    onChange: (key: string) => void;
    className?: string;
    variant?: 'pill' | 'underline';
    size?: 'sm' | 'md';
}

/**
 * PillTabs — accessible animated tab strip with sliding active background.
 * Use `pill` for filter-like UI or `underline` for content-section navigation.
 */
export function PillTabs({
    tabs,
    active,
    onChange,
    className = '',
    variant = 'pill',
    size = 'md',
}: PillTabsProps) {
    const pad = size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-4 text-sm';
    if (variant === 'underline') {
        return (
            <div
                role="tablist"
                className={`relative inline-flex items-center gap-2 border-b border-[color:var(--ai-card-border)] ${className}`}
            >
                {tabs.map((tab) => {
                    const isActive = tab.key === active;
                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChange(tab.key)}
                            className={`relative ${pad} font-medium transition-colors ${isActive
                                    ? 'text-[color:var(--ai-foreground)]'
                                    : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                {tab.icon}
                                {tab.label}
                                {tab.badge !== undefined && (
                                    <span className="text-[10px] px-1.5 h-4 inline-flex items-center rounded-full bg-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)]">
                                        {tab.badge}
                                    </span>
                                )}
                            </span>
                            {isActive && (
                                <motion.span
                                    layoutId="user-tabs-underline"
                                    className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div
            role="tablist"
            className={`relative inline-flex items-center gap-1 rounded-full border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-md p-1 ${className}`}
        >
            {tabs.map((tab) => {
                const isActive = tab.key === active;
                return (
                    <button
                        key={tab.key}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(tab.key)}
                        className={`relative ${pad} rounded-full font-medium transition-colors ${isActive
                                ? 'text-white'
                                : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                            }`}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="user-tabs-pill"
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-md shadow-[color:var(--ai-primary)]/20"
                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                            />
                        )}
                        <span className="relative inline-flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span
                                    className={`text-[10px] px-1.5 h-4 inline-flex items-center rounded-full ${isActive
                                            ? 'bg-white/25 text-white'
                                            : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)]'
                                        }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

interface AnimatedTabPanelProps {
    activeKey: string;
    children: React.ReactNode;
    className?: string;
}

export function AnimatedTabPanel({ activeKey, children, className = '' }: AnimatedTabPanelProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

export default PillTabs;
