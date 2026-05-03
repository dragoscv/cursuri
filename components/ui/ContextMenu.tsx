'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable right-click + long-press context menu.
 *
 * Usage:
 *   <ContextMenu items={[...]}>
 *     <tr>...</tr>
 *   </ContextMenu>
 *
 * Items support `divider`, `danger`, `disabled`, `icon`, `description`,
 * and optional `onSelect` handler. Touch devices get a 500ms long-press
 * trigger; desktop uses the native `contextmenu` event.
 */

export interface ContextMenuItem {
    /** Stable id for keyboard nav / React keys. */
    id: string;
    /** Label shown in the menu. Pass null to render a divider when used together with `divider: true`. */
    label?: React.ReactNode;
    /** Secondary muted text. */
    description?: React.ReactNode;
    /** Optional leading icon. */
    icon?: React.ReactNode;
    /** Render a horizontal separator above this item. */
    divider?: boolean;
    /** Render in danger style (e.g. delete actions). */
    danger?: boolean;
    /** Disable the item. */
    disabled?: boolean;
    /** Optional keyboard hint shown right-aligned. */
    shortcut?: string;
    /** Called when the user clicks/taps the item. The menu always closes after. */
    onSelect?: (event: React.MouseEvent | React.KeyboardEvent) => void;
}

interface ContextMenuOpenState {
    items: ContextMenuItem[];
    x: number;
    y: number;
    contextLabel?: string;
}

interface ContextMenuApi {
    open: (state: ContextMenuOpenState) => void;
    close: () => void;
    isOpen: boolean;
}

const ContextMenuContext = createContext<ContextMenuApi | null>(null);

export const useContextMenuApi = () => useContext(ContextMenuContext);

/**
 * Top-level provider. Mount once at the page/layout level so a single menu
 * surface is shared across every trigger on the page (better z-index hygiene
 * than each trigger creating its own portal).
 */
export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ContextMenuOpenState | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);
    const [adjusted, setAdjusted] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => setMounted(true), []);

    const close = useCallback(() => {
        setState(null);
        setAdjusted(null);
    }, []);

    const open = useCallback((next: ContextMenuOpenState) => {
        setState(next);
    }, []);

    // Close on outside click, scroll, escape.
    useEffect(() => {
        if (!state) return;
        const onPointer = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node | null;
            if (menuRef.current && target && !menuRef.current.contains(target)) close();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        const onScrollOrResize = () => close();
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('touchstart', onPointer, { passive: true });
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('touchstart', onPointer);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [state, close]);

    // After mount, clamp the menu to the viewport.
    useEffect(() => {
        if (!state || !menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const padding = 8;
        let nx = state.x;
        let ny = state.y;
        if (nx + rect.width > window.innerWidth - padding) {
            nx = Math.max(padding, window.innerWidth - rect.width - padding);
        }
        if (ny + rect.height > window.innerHeight - padding) {
            ny = Math.max(padding, window.innerHeight - rect.height - padding);
        }
        setAdjusted({ x: nx, y: ny });
    }, [state]);

    const api = useMemo<ContextMenuApi>(
        () => ({ open, close, isOpen: !!state }),
        [open, close, state]
    );

    return (
        <ContextMenuContext.Provider value={api}>
            {children}
            {mounted && state
                ? createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        aria-label={state.contextLabel || 'Context menu'}
                        className="fixed z-[10000] min-w-[220px] max-w-[300px] rounded-xl border border-[color:var(--ai-card-border)]/80 bg-[color:var(--ai-card-bg)]/95 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-black/5 overflow-hidden animate-context-menu-in py-1"
                        style={{
                            top: (adjusted?.y ?? state.y) + 'px',
                            left: (adjusted?.x ?? state.x) + 'px',
                            opacity: adjusted ? 1 : 0,
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {state.contextLabel && (
                            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--ai-muted)]/80 border-b border-[color:var(--ai-card-border)]/40 mb-1">
                                {state.contextLabel}
                            </div>
                        )}
                        {state.items.map((item, idx) => {
                            if (item.divider && idx > 0) {
                                return (
                                    <div
                                        key={item.id + '-div'}
                                        className="my-1 mx-2 h-px bg-[color:var(--ai-card-border)]/50"
                                        role="separator"
                                    />
                                );
                            }
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="menuitem"
                                    disabled={item.disabled}
                                    onClick={(e) => {
                                        if (item.disabled) return;
                                        item.onSelect?.(e);
                                        close();
                                    }}
                                    className={[
                                        'group w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                                        'focus:outline-none focus-visible:bg-[color:var(--ai-primary)]/15',
                                        item.disabled
                                            ? 'opacity-40 cursor-not-allowed'
                                            : item.danger
                                                ? 'text-[color:var(--ai-danger)] hover:bg-[color:var(--ai-danger)]/12'
                                                : 'text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/12',
                                    ].join(' ')}
                                >
                                    {item.icon && (
                                        <span
                                            className={[
                                                'h-4 w-4 grid place-items-center shrink-0',
                                                item.danger
                                                    ? 'text-[color:var(--ai-danger)]'
                                                    : 'text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-primary)]',
                                            ].join(' ')}
                                        >
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="flex-1 min-w-0">
                                        <span className="block truncate">{item.label}</span>
                                        {item.description && (
                                            <span className="block text-[11px] text-[color:var(--ai-muted)] truncate">
                                                {item.description}
                                            </span>
                                        )}
                                    </span>
                                    {item.shortcut && (
                                        <kbd className="text-[10px] font-mono text-[color:var(--ai-muted)]/80">
                                            {item.shortcut}
                                        </kbd>
                                    )}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )
                : null}
        </ContextMenuContext.Provider>
    );
};

interface ContextMenuTriggerProps {
    /** Items to render. Pass a function to compute lazily on each open. */
    items: ContextMenuItem[] | (() => ContextMenuItem[]);
    /** Optional label rendered as the menu's heading. */
    contextLabel?: string;
    /** Touch long-press duration in ms (default 500). */
    longPressMs?: number;
    /** Disable the trigger entirely. */
    disabled?: boolean;
    children: React.ReactElement;
}

/**
 * Wraps a single child element and attaches right-click + long-press
 * handlers that open the page-level context menu. The child must accept
 * the standard event handlers (most native elements do).
 */
export const ContextMenuTrigger: React.FC<ContextMenuTriggerProps> = ({
    items,
    contextLabel,
    longPressMs = 500,
    disabled,
    children,
}) => {
    const api = useContextMenuApi();
    const id = useId();
    const longPressTimer = useRef<number | null>(null);
    const longPressFired = useRef(false);
    const startPos = useRef<{ x: number; y: number } | null>(null);

    if (!api) {
        // Allow trigger to render without a provider; just fall through.
        return children;
    }

    const resolveItems = () => (typeof items === 'function' ? items() : items);

    const handleContextMenu = (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        api.open({ items: resolveItems(), x: e.clientX, y: e.clientY, contextLabel });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;
        const t = e.touches[0];
        if (!t) return;
        startPos.current = { x: t.clientX, y: t.clientY };
        longPressFired.current = false;
        longPressTimer.current = window.setTimeout(() => {
            longPressFired.current = true;
            // Haptic feedback where available.
            try {
                navigator.vibrate?.(30);
            } catch {
                /* ignore */
            }
            api.open({
                items: resolveItems(),
                x: startPos.current?.x ?? 0,
                y: startPos.current?.y ?? 0,
                contextLabel,
            });
        }, longPressMs);
    };

    const cancelLongPress = () => {
        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const t = e.touches[0];
        if (!t || !startPos.current) return;
        const dx = Math.abs(t.clientX - startPos.current.x);
        const dy = Math.abs(t.clientY - startPos.current.y);
        if (dx > 10 || dy > 10) cancelLongPress();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        cancelLongPress();
        // Suppress the synthetic click that follows a long-press so the
        // underlying row's onClick (e.g. navigate) doesn't fire.
        if (longPressFired.current) {
            e.preventDefault();
            longPressFired.current = false;
        }
    };

    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;

    return React.cloneElement(child, {
        key: id,
        onContextMenu: (e: React.MouseEvent) => {
            handleContextMenu(e);
            const existing = (child.props as { onContextMenu?: (e: React.MouseEvent) => void })
                .onContextMenu;
            existing?.(e);
        },
        onTouchStart: (e: React.TouchEvent) => {
            handleTouchStart(e);
            const existing = (child.props as { onTouchStart?: (e: React.TouchEvent) => void })
                .onTouchStart;
            existing?.(e);
        },
        onTouchMove: (e: React.TouchEvent) => {
            handleTouchMove(e);
            const existing = (child.props as { onTouchMove?: (e: React.TouchEvent) => void })
                .onTouchMove;
            existing?.(e);
        },
        onTouchEnd: (e: React.TouchEvent) => {
            handleTouchEnd(e);
            const existing = (child.props as { onTouchEnd?: (e: React.TouchEvent) => void })
                .onTouchEnd;
            existing?.(e);
        },
        onTouchCancel: (e: React.TouchEvent) => {
            cancelLongPress();
            const existing = (child.props as { onTouchCancel?: (e: React.TouchEvent) => void })
                .onTouchCancel;
            existing?.(e);
        },
    });
};
