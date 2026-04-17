'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from '@/components/icons/FeatherIcons';

import { ADMIN_NAV_ITEMS, type AdminNavItem } from './navigation';
import { useAdminShell } from './useAdminShell';
import { IconCommand, IconExternal, IconBolt } from './icons';

interface PaletteCommand extends AdminNavItem {
  group: string;
}

const QUICK_ACTIONS: PaletteCommand[] = [
  {
    id: 'add-course',
    label: 'Add new course',
    href: '/admin/courses/add',
    icon: IconBolt as any,
    keywords: ['create', 'new', 'course'],
    group: 'Quick actions',
  },
  {
    id: 'view-site',
    label: 'Open public site',
    href: '/',
    icon: IconExternal as any,
    keywords: ['home', 'public'],
    group: 'Quick actions',
  },
];

const AdminCommandPalette: React.FC = () => {
  const { paletteOpen, setPaletteOpen } = useAdminShell();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<PaletteCommand[]>(() => {
    const navCmds: PaletteCommand[] = ADMIN_NAV_ITEMS.map((i) => ({ ...i, group: 'Pages' }));
    return [...navCmds, ...QUICK_ACTIONS];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const hay = [i.label, ...(i.keywords ?? [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  // group by .group preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, PaletteCommand[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // reset on open
  useEffect(() => {
    if (paletteOpen) {
      setQuery('');
      setActiveIdx(0);
      // focus input after mount
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [paletteOpen]);

  // keyboard nav
  useEffect(() => {
    if (!paletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = filtered[activeIdx];
        if (target) {
          setPaletteOpen(false);
          router.push(target.href);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paletteOpen, filtered, activeIdx, router, setPaletteOpen]);

  const handleSelect = (cmd: PaletteCommand) => {
    setPaletteOpen(false);
    router.push(cmd.href);
  };

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPaletteOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-xl rounded-2xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 h-14 border-b border-[color:var(--ai-card-border)]">
              <FiSearch size={18} className="text-[color:var(--ai-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                placeholder="Search pages, actions…"
                className="flex-1 bg-transparent outline-none text-sm text-[color:var(--ai-foreground)] placeholder:text-[color:var(--ai-muted)]"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[color:var(--ai-card-border)] text-[10px] font-medium text-[color:var(--ai-muted)]">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {grouped.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-[color:var(--ai-muted)]">
                  No results for &quot;{query}&quot;
                </div>
              )}
              {grouped.map(([group, cmds]) => (
                <div key={group} className="px-2 py-1">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-[color:var(--ai-muted)]/70">
                    {group}
                  </div>
                  <ul>
                    {cmds.map((cmd) => {
                      const idx = filtered.indexOf(cmd);
                      const isActive = idx === activeIdx;
                      const Icon = cmd.icon;
                      return (
                        <li key={cmd.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIdx(idx)}
                            onClick={() => handleSelect(cmd)}
                            className={[
                              'w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/15 to-[color:var(--ai-secondary)]/5 text-[color:var(--ai-foreground)]'
                                : 'text-[color:var(--ai-foreground)]/85 hover:bg-[color:var(--ai-primary)]/5',
                            ].join(' ')}
                          >
                            <Icon size={16} className={isActive ? 'text-[color:var(--ai-primary)]' : 'opacity-80'} />
                            <span className="flex-1 text-left truncate">{cmd.label}</span>
                            <span className="text-[10px] text-[color:var(--ai-muted)]">{cmd.href}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 h-9 border-t border-[color:var(--ai-card-border)] text-[11px] text-[color:var(--ai-muted)]">
              <span className="inline-flex items-center gap-1">
                <IconCommand size={11} /> K to open · ↑↓ navigate · ↵ select
              </span>
              <span>{filtered.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminCommandPalette;
