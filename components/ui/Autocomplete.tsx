'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface AutocompleteOption<TValue extends string = string> {
    value: TValue;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    /** Optional secondary text searched in addition to label (e.g. id, email). */
    keywords?: string;
}

export interface AutocompleteProps<TValue extends string = string> {
    label?: string;
    placeholder?: string;
    value: TValue | '';
    onChange: (value: TValue | '') => void;
    options: AutocompleteOption<TValue>[];
    /** Show a "clear" button when a value is set. Default true. */
    clearable?: boolean;
    /** Additional class names for the trigger element. */
    className?: string;
    /** Allow the input to render a free-text label that doesn't match any option. Default false. */
    allowFreeText?: boolean;
    size?: 'sm' | 'md';
    ariaLabel?: string;
    isDisabled?: boolean;
    /** Optional leading icon rendered inside the trigger. */
    startContent?: React.ReactNode;
    /** Maximum number of options shown at once. Defaults to 200. */
    maxResults?: number;
    /** Render no-results state with a custom node. */
    emptyContent?: React.ReactNode;
}

/**
 * Lightweight combobox / autocomplete that mirrors the visual style of
 * components/ui/Select but lets users type to filter, supports keyboard
 * navigation, and renders a portaled popover to escape ancestor overflow.
 *
 * Designed to be a drop-in replacement for the filter dropdowns on admin
 * list pages.
 */
export function Autocomplete<TValue extends string = string>({
    label,
    placeholder = 'Search…',
    value,
    onChange,
    options,
    clearable = true,
    className = '',
    allowFreeText = false,
    size = 'sm',
    ariaLabel,
    isDisabled = false,
    startContent,
    maxResults = 200,
    emptyContent,
}: AutocompleteProps<TValue>) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [position, setPosition] = useState<{
        top: number;
        left: number;
        width: number;
        placement: 'bottom' | 'top';
    }>({ top: 0, left: 0, width: 0, placement: 'bottom' });
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const selected = useMemo(
        () => options.find((o) => o.value === value) ?? null,
        [options, value]
    );

    // When the popover is closed, the input shows the selected label (read-only feel).
    // When open, the input becomes editable with the user's query.
    const displayValue = open ? query : selected?.label ?? '';

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options.slice(0, maxResults);
        return options
            .filter((o) => {
                const haystack = `${o.label} ${o.description ?? ''} ${o.keywords ?? ''}`.toLowerCase();
                return haystack.includes(q);
            })
            .slice(0, maxResults);
    }, [options, query, maxResults]);

    useEffect(() => {
        if (open) setActiveIndex(0);
    }, [open, query]);

    const updatePlacement = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const popoverHeight = Math.min(320, filtered.length * 38 + 16);
        const spaceBelow = window.innerHeight - rect.bottom;
        const placement: 'bottom' | 'top' =
            spaceBelow < popoverHeight && rect.top > popoverHeight ? 'top' : 'bottom';
        setPosition({
            top: placement === 'bottom' ? rect.bottom + window.scrollY : rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            placement,
        });
    };

    useEffect(() => {
        if (!open) return;
        updatePlacement();
        const handler = () => updatePlacement();
        window.addEventListener('resize', handler);
        window.addEventListener('scroll', handler, true);
        return () => {
            window.removeEventListener('resize', handler);
            window.removeEventListener('scroll', handler, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, filtered.length]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (
                triggerRef.current?.contains(t) ||
                popoverRef.current?.contains(t)
            )
                return;
            setOpen(false);
            setQuery('');
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleSelect = (opt: AutocompleteOption<TValue>) => {
        onChange(opt.value);
        setOpen(false);
        setQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('' as TValue | '');
        setQuery('');
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'ArrowUp')) {
            setOpen(true);
            return;
        }
        if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
            triggerRef.current?.focus();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const opt = filtered[activeIndex];
            if (opt) handleSelect(opt);
            else if (allowFreeText && query) {
                onChange(query as TValue);
                setOpen(false);
            }
        } else if (e.key === 'Tab') {
            setOpen(false);
            setQuery('');
        }
    };

    const sizeClasses =
        size === 'sm' ? 'h-9 text-sm px-3' : 'h-10 text-sm px-3';

    return (
        <div className={['relative', className].join(' ')}>
            {label && (
                <label
                    htmlFor={`autocomplete-${id}`}
                    className="block text-xs font-medium text-[color:var(--ai-foreground)]/80 mb-1.5"
                >
                    {label}
                </label>
            )}
            <div
                ref={triggerRef}
                className={[
                    'group relative flex items-center gap-2 rounded-lg bg-[color:var(--ai-card-bg)]/70 border border-[color:var(--ai-card-border)] transition-colors',
                    isDisabled
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:border-[color:var(--ai-primary)]/40 focus-within:border-[color:var(--ai-primary)] focus-within:ring-2 focus-within:ring-[color:var(--ai-primary)]/20',
                    sizeClasses,
                ].join(' ')}
                onClick={() => {
                    if (isDisabled) return;
                    setOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
            >
                {startContent && (
                    <span className="text-[color:var(--ai-muted)] shrink-0">{startContent}</span>
                )}
                {selected?.icon && !open && (
                    <span className="shrink-0 text-[color:var(--ai-muted)]">{selected.icon}</span>
                )}
                <input
                    id={`autocomplete-${id}`}
                    ref={inputRef}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`autocomplete-listbox-${id}`}
                    aria-autocomplete="list"
                    aria-label={ariaLabel || label}
                    disabled={isDisabled}
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 bg-transparent outline-none text-[color:var(--ai-foreground)] placeholder:text-[color:var(--ai-muted)]/70"
                />
                {clearable && value && !open && (
                    <button
                        type="button"
                        aria-label="Clear"
                        onClick={handleClear}
                        className="shrink-0 h-5 w-5 grid place-items-center rounded text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/40 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
                <span
                    className={[
                        'shrink-0 text-[color:var(--ai-muted)] transition-transform',
                        open ? 'rotate-180' : '',
                    ].join(' ')}
                    aria-hidden="true"
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
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </div>

            {mounted && open
                ? createPortal(
                    <div
                        ref={popoverRef}
                        id={`autocomplete-listbox-${id}`}
                        role="listbox"
                        className="fixed z-[10000] rounded-xl border border-[color:var(--ai-card-border)]/80 bg-[color:var(--ai-card-bg)]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
                        style={{
                            top:
                                position.placement === 'bottom'
                                    ? position.top - window.scrollY + 4
                                    : position.top - window.scrollY - 4,
                            left: position.left - window.scrollX,
                            width: position.width,
                            transform:
                                position.placement === 'top' ? 'translateY(-100%)' : undefined,
                        }}
                    >
                        <div className="max-h-[320px] overflow-y-auto py-1">
                            {filtered.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-[color:var(--ai-muted)]">
                                    {emptyContent || (query ? `No results for “${query}”` : 'No options')}
                                </div>
                            ) : (
                                filtered.map((opt, i) => {
                                    const isActive = i === activeIndex;
                                    const isSelected = opt.value === value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            onMouseEnter={() => setActiveIndex(i)}
                                            onClick={() => handleSelect(opt)}
                                            className={[
                                                'w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                                                isActive
                                                    ? 'bg-[color:var(--ai-primary)]/12 text-[color:var(--ai-foreground)]'
                                                    : 'text-[color:var(--ai-foreground)]/90 hover:bg-[color:var(--ai-primary)]/8',
                                            ].join(' ')}
                                        >
                                            {opt.icon && (
                                                <span className="shrink-0 text-[color:var(--ai-muted)]">
                                                    {opt.icon}
                                                </span>
                                            )}
                                            <span className="flex-1 min-w-0">
                                                <span className="block truncate">{opt.label}</span>
                                                {opt.description && (
                                                    <span className="block text-[11px] text-[color:var(--ai-muted)] truncate">
                                                        {opt.description}
                                                    </span>
                                                )}
                                            </span>
                                            {isSelected && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-[color:var(--ai-primary)] shrink-0"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>,
                    document.body
                )
                : null}
        </div>
    );
}

export default Autocomplete;
