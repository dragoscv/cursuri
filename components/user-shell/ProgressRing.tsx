'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
    /** 0–100 */
    value: number;
    size?: number;
    strokeWidth?: number;
    /** Custom label inside the ring; defaults to `${value}%` */
    label?: React.ReactNode;
    tone?: 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

const toneStops: Record<NonNullable<ProgressRingProps['tone']>, [string, string]> = {
    primary: ['var(--ai-primary)', 'var(--ai-secondary)'],
    success: ['#10b981', '#34d399'],
    warning: ['#f59e0b', '#fbbf24'],
    danger: ['#ef4444', '#f43f5e'],
};

export function ProgressRing({
    value,
    size = 80,
    strokeWidth = 8,
    label,
    tone = 'primary',
    className = '',
}: ProgressRingProps) {
    const clamped = Math.max(0, Math.min(100, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = (clamped / 100) * circumference;
    const [from, to] = toneStops[tone];
    const gradId = `pr-${tone}-${size}`;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={from} />
                        <stop offset="100%" stopColor={to} />
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-[color:var(--ai-card-border)]/40"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#${gradId})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - dash }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[color:var(--ai-foreground)]">
                {label ?? `${Math.round(clamped)}%`}
            </div>
        </div>
    );
}

export default ProgressRing;
