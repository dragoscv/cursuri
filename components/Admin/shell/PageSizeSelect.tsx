'use client';

import React from 'react';

export interface PageSizeSelectProps {
    /** Current page size. */
    value: number;
    /** Called when the user picks a new page size. */
    onChange: (next: number) => void;
    /** Available options. Defaults to [12, 25, 50, 100, 250, 500]. */
    options?: number[];
    /** Optional label rendered before the control (e.g. "Show"). */
    label?: string;
    /** Optional suffix (e.g. "per page"). */
    suffix?: string;
    className?: string;
}

const DEFAULT_OPTIONS = [12, 25, 50, 100, 250, 500];

/**
 * Tiny inline select for choosing how many rows per page in admin tables.
 *
 * Pairs naturally with localStorage persistence handled by the caller so each
 * admin list page can have its own remembered page size.
 */
export const PageSizeSelect: React.FC<PageSizeSelectProps> = ({
    value,
    onChange,
    options = DEFAULT_OPTIONS,
    label = 'Show',
    suffix = 'per page',
    className = '',
}) => {
    return (
        <label
            className={[
                'inline-flex items-center gap-2 text-xs text-[color:var(--ai-muted)]',
                className,
            ].join(' ')}
        >
            {label && <span>{label}</span>}
            <span className="relative inline-flex">
                <select
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    aria-label="Rows per page"
                    className={[
                        'appearance-none pl-2.5 pr-7 py-1.5 rounded-lg cursor-pointer',
                        'bg-[color:var(--ai-card-bg)]/70 border border-[color:var(--ai-card-border)]',
                        'text-[color:var(--ai-foreground)] text-xs font-medium',
                        'hover:border-[color:var(--ai-primary)]/40',
                        'focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/40 focus:border-[color:var(--ai-primary)]/60',
                        'transition-colors tabular-nums',
                    ].join(' ')}
                >
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
                <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    aria-hidden="true"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[color:var(--ai-muted)] pointer-events-none"
                >
                    <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            {suffix && <span>{suffix}</span>}
        </label>
    );
};

export default PageSizeSelect;
