'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    /** Small label above the title (eg. "Users") */
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    /** Optional icon shown to the left of the title */
    icon?: React.ReactNode;
    /** Optional decorative tint (gradient) — primary | success | warning | danger */
    tone?: 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

const toneRing: Record<NonNullable<Props['tone']>, string> = {
    primary: 'from-[color:var(--ai-primary)]/12 via-[color:var(--ai-secondary)]/8 to-transparent',
    success: 'from-emerald-500/12 via-teal-500/6 to-transparent',
    warning: 'from-amber-500/12 via-orange-500/6 to-transparent',
    danger: 'from-rose-500/12 via-red-500/6 to-transparent',
};

const PageHeader: React.FC<Props> = ({
    eyebrow,
    title,
    description,
    actions,
    icon,
    tone = 'primary',
    className = '',
}) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={[
                'relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)]',
                'bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm',
                'mb-6',
                className,
            ].join(' ')}
        >
            {/* Tinted gradient layer */}
            <div className={`absolute inset-0 bg-gradient-to-br ${toneRing[tone]} pointer-events-none`} />

            {/* Decorative dot grid */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="ph-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ph-dots)" />
                </svg>
            </div>

            {/* Animated decorative blob */}
            <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.35, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="pointer-events-none absolute -top-12 -right-10 h-44 w-44 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/30 to-[color:var(--ai-secondary)]/30 blur-3xl"
            />

            <div className="relative p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                    {icon && (
                        <div className="shrink-0 h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.55)]">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0">
                        {eyebrow && (
                            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[color:var(--ai-primary)] mb-1.5">
                                {eyebrow}
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-[28px] font-bold leading-tight bg-gradient-to-r from-[color:var(--ai-foreground)] to-[color:var(--ai-foreground)]/70 bg-clip-text text-transparent">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-[color:var(--ai-muted)] max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">{actions}</div>
                )}
            </div>
        </motion.section>
    );
};

export default PageHeader;
