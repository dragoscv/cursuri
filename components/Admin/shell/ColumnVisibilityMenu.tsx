'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ColumnDef<TKey extends string = string> {
    key: TKey;
    label: string;
    /** When true the column cannot be hidden by the user. */
    locked?: boolean;
    /** Optional secondary description shown in the toggle menu. */
    description?: string;
}

interface Props<TKey extends string> {
    columns: ColumnDef<TKey>[];
    visible: Record<TKey, boolean>;
    onChange: (next: Record<TKey, boolean>) => void;
    /** Optional reset to defaults handler. */
    onReset?: () => void;
    triggerLabel?: string;
}

/**
 * Pop-over menu that lets users toggle the visibility of table columns.
 * Used in admin list pages.
 */
export function ColumnVisibilityMenu<TKey extends string>({
    columns,
    visible,
    onChange,
    onReset,
    triggerLabel = 'Columns',
}: Props<TKey>) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (
                triggerRef.current?.contains(t) ||
                menuRef.current?.contains(t)
            )
                return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        const menuW = 240;
        const left = Math.min(window.innerWidth - menuW - 8, r.right - menuW);
        setPosition({ top: r.bottom + window.scrollY + 6, left: Math.max(8, left) });
    }, [open]);

    const visibleCount = (Object.values(visible) as boolean[]).filter(Boolean).length;

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 text-sm text-[color:var(--ai-foreground)]/90 hover:border-[color:var(--ai-primary)]/40 transition-colors"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="15" y2="12" />
                    <line x1="3" y1="18" x2="9" y2="18" />
                </svg>
                <span>{triggerLabel}</span>
                <span className="text-[10px] font-semibold text-[color:var(--ai-muted)] tabular-nums">
                    {visibleCount}/{columns.length}
                </span>
            </button>
            {mounted && open && position
                ? createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        className="fixed z-[10000] w-[240px] rounded-xl border border-[color:var(--ai-card-border)]/80 bg-[color:var(--ai-card-bg)]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden py-1"
                        style={{ top: position.top, left: position.left }}
                    >
                        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--ai-muted)]/80 border-b border-[color:var(--ai-card-border)]/40">
                            Toggle columns
                        </div>
                        <div className="max-h-[360px] overflow-y-auto py-1">
                            {columns.map((col) => {
                                const checked = !!visible[col.key];
                                return (
                                    <label
                                        key={col.key}
                                        className={[
                                            'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer',
                                            col.locked
                                                ? 'opacity-60 cursor-not-allowed'
                                                : 'hover:bg-[color:var(--ai-primary)]/8',
                                        ].join(' ')}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={col.locked}
                                            onChange={(e) => {
                                                if (col.locked) return;
                                                onChange({ ...visible, [col.key]: e.target.checked });
                                            }}
                                            className="accent-[color:var(--ai-primary)] cursor-pointer"
                                        />
                                        <span className="flex-1 min-w-0 text-[color:var(--ai-foreground)]/90">
                                            <span className="block truncate">{col.label}</span>
                                            {col.description && (
                                                <span className="block text-[11px] text-[color:var(--ai-muted)] truncate">
                                                    {col.description}
                                                </span>
                                            )}
                                        </span>
                                        {col.locked && (
                                            <span className="text-[10px] text-[color:var(--ai-muted)]/80 uppercase tracking-wider">
                                                Locked
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {onReset && (
                            <div className="border-t border-[color:var(--ai-card-border)]/40 px-2 py-1.5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onReset();
                                        setOpen(false);
                                    }}
                                    className="text-xs text-[color:var(--ai-primary)] hover:underline px-2 py-1"
                                >
                                    Reset to defaults
                                </button>
                            </div>
                        )}
                    </div>,
                    document.body
                )
                : null}
        </>
    );
}

export default ColumnVisibilityMenu;
