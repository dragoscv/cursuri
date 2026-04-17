'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GradientCard from './GradientCard';

interface MetricCardProps {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    icon?: React.ReactNode;
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    delta?: number; // optional percentage delta
    className?: string;
}

const toneIcon: Record<NonNullable<MetricCardProps['tone']>, string> = {
    primary: 'from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white',
    success: 'from-emerald-500 to-teal-500 text-white',
    warning: 'from-amber-500 to-orange-500 text-white',
    danger: 'from-rose-500 to-red-500 text-white',
    neutral: 'from-slate-500 to-slate-700 text-white',
};

/**
 * MetricCard — user-facing KPI card with icon, value, hint and optional delta chip.
 * Larger and friendlier than the admin StatCard.
 */
export function MetricCard({
    label,
    value,
    hint,
    icon,
    tone = 'primary',
    delta,
    className = '',
}: MetricCardProps) {
    const showDelta = typeof delta === 'number' && !Number.isNaN(delta);
    const deltaUp = (delta ?? 0) >= 0;
    return (
        <GradientCard interactive glow tone={tone === 'neutral' ? 'default' : tone} className={className}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-medium">
                        {label}
                    </p>
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight text-[color:var(--ai-foreground)]"
                    >
                        {value}
                    </motion.div>
                    {hint && (
                        <p className="mt-1 text-xs text-[color:var(--ai-muted)] truncate">{hint}</p>
                    )}
                </div>
                {icon && (
                    <div
                        className={`shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br ${toneIcon[tone]} shadow-md shadow-black/5`}
                    >
                        {icon}
                    </div>
                )}
            </div>
            {showDelta && (
                <div className="mt-3 inline-flex items-center gap-1.5">
                    <span
                        className={`inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-semibold ${deltaUp
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                    >
                        <svg
                            className={`w-3 h-3 ${deltaUp ? '' : 'rotate-180'}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14M5 12l7-7 7 7" />
                        </svg>
                        {Math.abs(delta!).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-[color:var(--ai-muted)]">vs previous</span>
                </div>
            )}
        </GradientCard>
    );
}

export default MetricCard;
