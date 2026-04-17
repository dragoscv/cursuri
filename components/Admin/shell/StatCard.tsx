'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp } from '@/components/icons/FeatherIcons';

interface Props {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    /** Trend percentage. Positive number = up, negative = down */
    trend?: number;
    icon?: React.ReactNode;
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    loading?: boolean;
    className?: string;
}

const toneIconBg: Record<NonNullable<Props['tone']>, string> = {
    primary: 'from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white',
    success: 'from-emerald-500 to-teal-500 text-white',
    warning: 'from-amber-500 to-orange-500 text-white',
    danger: 'from-rose-500 to-red-500 text-white',
    neutral: 'from-slate-400 to-slate-600 text-white',
};

const StatCard: React.FC<Props> = ({
    label,
    value,
    hint,
    trend,
    icon,
    tone = 'primary',
    loading = false,
    className = '',
}) => {
    const trendUp = (trend ?? 0) >= 0;
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={[
                'relative overflow-hidden rounded-2xl p-5',
                'bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm',
                'border border-[color:var(--ai-card-border)]',
                'shadow-[0_4px_18px_-12px_rgba(0,0,0,0.25)]',
                'hover:shadow-[0_10px_30px_-14px_rgba(99,102,241,0.35)] transition-shadow',
                className,
            ].join(' ')}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--ai-muted)]">
                    {label}
                </div>
                {icon && (
                    <div
                        className={[
                            'shrink-0 h-9 w-9 grid place-items-center rounded-xl bg-gradient-to-br shadow-md',
                            toneIconBg[tone],
                        ].join(' ')}
                    >
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end gap-2">
                {loading ? (
                    <div className="h-8 w-24 rounded-md bg-[color:var(--ai-card-border)]/60 animate-pulse" />
                ) : (
                    <div className="text-2xl sm:text-3xl font-bold text-[color:var(--ai-foreground)] leading-none tracking-tight">
                        {value}
                    </div>
                )}
                {typeof trend === 'number' && !loading && (
                    <span
                        className={[
                            'inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full',
                            trendUp
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                                : 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
                        ].join(' ')}
                    >
                        <FiTrendingUp
                            size={11}
                            className={trendUp ? '' : 'rotate-180'}
                        />
                        {Math.abs(trend).toFixed(1)}%
                    </span>
                )}
            </div>

            {hint && (
                <div className="mt-2 text-xs text-[color:var(--ai-muted)] truncate">{hint}</div>
            )}
        </motion.div>
    );
};

export default StatCard;
