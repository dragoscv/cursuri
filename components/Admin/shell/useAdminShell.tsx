'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface AdminShellState {
    collapsed: boolean;
    toggleCollapsed: () => void;
    setCollapsed: (v: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
    paletteOpen: boolean;
    setPaletteOpen: (v: boolean) => void;
}

const Ctx = createContext<AdminShellState | null>(null);

const STORAGE_KEY = 'admin-shell-collapsed';

export const AdminShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [collapsed, setCollapsedState] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);

    // Hydrate persisted state
    useEffect(() => {
        try {
            const v = window.localStorage.getItem(STORAGE_KEY);
            if (v === '1') setCollapsedState(true);
        } catch {
            /* ignore */
        }
    }, []);

    const setCollapsed = useCallback((v: boolean) => {
        setCollapsedState(v);
        try {
            window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
        } catch {
            /* ignore */
        }
    }, []);

    const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

    // Global keyboard: Cmd/Ctrl+K opens palette, Cmd/Ctrl+B toggles sidebar
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen(true);
            } else if (mod && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setCollapsed(!collapsed);
            } else if (e.key === 'Escape') {
                setMobileOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [collapsed, setCollapsed]);

    const value = useMemo(
        () => ({ collapsed, toggleCollapsed, setCollapsed, mobileOpen, setMobileOpen, paletteOpen, setPaletteOpen }),
        [collapsed, toggleCollapsed, setCollapsed, mobileOpen, paletteOpen]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAdminShell = (): AdminShellState => {
    const v = useContext(Ctx);
    if (!v) throw new Error('useAdminShell must be used within AdminShellProvider');
    return v;
};
