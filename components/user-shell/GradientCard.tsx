'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GradientCardProps {
    children: React.ReactNode;
    className?: string;
    /** Subtle hover lift */
    interactive?: boolean;
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    /** Removes default padding for custom layouts */
    flush?: boolean;
    /** Extra glow ring on hover */
    glow?: boolean;
    as?: 'div' | 'article' | 'section' | 'a';
    href?: string;
    onClick?: () => void;
}

const toneRing: Record<NonNullable<GradientCardProps['tone']>, string> = {
    default: 'from-[color:var(--ai-primary)]/0 to-[color:var(--ai-secondary)]/0',
    primary: 'from-[color:var(--ai-primary)]/40 to-[color:var(--ai-secondary)]/40',
    success: 'from-emerald-400/40 to-teal-400/40',
    warning: 'from-amber-400/40 to-orange-400/40',
    danger: 'from-rose-400/40 to-red-400/40',
};

/**
 * GradientCard — the canonical card surface for user-facing content.
 * Provides a frosted glass body, animated gradient border on hover, and an optional glow.
 */
export function GradientCard({
    children,
    className = '',
    interactive = false,
    tone = 'default',
    flush = false,
    glow = false,
    as = 'div',
    href,
    onClick,
}: GradientCardProps) {
    const Wrapper: any = as === 'a' ? motion.a : motion.div;
    return (
        <Wrapper
            href={href}
            onClick={onClick}
            whileHover={interactive ? { y: -3 } : undefined}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className={`group relative rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl shadow-sm ${interactive
                    ? 'transition-shadow hover:shadow-xl hover:border-[color:var(--ai-primary)]/40 cursor-pointer'
                    : ''
                } ${flush ? '' : 'p-5 md:p-6'} ${className}`}
        >
            {glow && (
                <div
                    aria-hidden
                    className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${toneRing[tone]} opacity-0 group-hover:opacity-100 transition-opacity blur-md`}
                />
            )}
            <div className="relative">{children}</div>
        </Wrapper>
    );
}

export default GradientCard;
