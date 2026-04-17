'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionShellProps {
    /** Optional small uppercase label above the title */
    eyebrow?: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Optional inline action (button/link) shown on the right */
    actions?: React.ReactNode;
    /** Center align the heading block */
    centered?: boolean;
    /** Constrain max width of the inner column */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
    /** Vertical padding on the wrapper */
    spacing?: 'sm' | 'md' | 'lg';
    /** Tonal background gradient */
    tone?: 'neutral' | 'primary' | 'secondary' | 'subtle';
    className?: string;
    children?: React.ReactNode;
    id?: string;
}

const maxWidths: Record<NonNullable<SectionShellProps['maxWidth']>, string> = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[88rem]',
    none: '',
};

const spacings: Record<NonNullable<SectionShellProps['spacing']>, string> = {
    sm: 'py-10 md:py-12',
    md: 'py-14 md:py-20',
    lg: 'py-20 md:py-28',
};

const toneBg: Record<NonNullable<SectionShellProps['tone']>, string> = {
    neutral: '',
    primary:
        'bg-gradient-to-b from-[color:var(--ai-primary)]/5 via-transparent to-transparent',
    secondary:
        'bg-gradient-to-b from-[color:var(--ai-secondary)]/5 via-transparent to-transparent',
    subtle: 'bg-[color:var(--ai-card-bg)]/40',
};

/**
 * SectionShell is the canonical wrapper for any home/profile/courses landing-style block.
 * It provides consistent spacing, an animated heading and optional eyebrow + actions row.
 */
export function SectionShell({
    eyebrow,
    title,
    description,
    actions,
    centered = false,
    maxWidth = 'xl',
    spacing = 'md',
    tone = 'neutral',
    className = '',
    children,
    id,
}: SectionShellProps) {
    return (
        <section id={id} className={`relative w-full ${spacings[spacing]} ${toneBg[tone]} ${className}`}>
            <div
                className={`${maxWidths[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth === 'none' ? '' : 'w-full'
                    }`}
            >
                {(eyebrow || title || description || actions) && (
                    <div
                        className={`mb-8 md:mb-10 flex flex-col gap-4 ${actions
                                ? 'md:flex-row md:items-end md:justify-between'
                                : centered
                                    ? 'items-center text-center'
                                    : ''
                            }`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`max-w-3xl ${centered ? 'mx-auto' : ''}`}
                        >
                            {eyebrow && (
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] text-[11px] font-semibold uppercase tracking-[0.14em] ${centered ? '' : ''
                                        }`}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ai-primary)] animate-pulse" />
                                    {eyebrow}
                                </div>
                            )}
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[color:var(--ai-foreground)] tracking-tight">
                                {title}
                            </h2>
                            {description && (
                                <p className="mt-3 text-base md:text-lg text-[color:var(--ai-muted)] leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </motion.div>
                        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}

export default SectionShell;
