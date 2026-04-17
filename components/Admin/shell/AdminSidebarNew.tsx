'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Tooltip, Chip } from '@heroui/react';
import { signOut } from 'firebase/auth';

import { AppContext } from '@/components/AppContext';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import DefaultAvatar from '@/components/shared/DefaultAvatar';
import { FiLogOut } from '@/components/icons/FeatherIcons';

import { ADMIN_NAV } from './navigation';
import { useAdminShell } from './useAdminShell';
import { IconChevronLeft, IconSparkles, IconCommand } from './icons';

interface Props {
  variant?: 'desktop' | 'mobile';
}

const AdminSidebarNew: React.FC<Props> = ({ variant = 'desktop' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed, setMobileOpen, setPaletteOpen } = useAdminShell();
  const ctx = useContext(AppContext);
  const user = ctx?.user;

  const isMobile = variant === 'mobile';
  const isCollapsed = !isMobile && collapsed;

  const handleSignOut = async () => {
    await signOut(firebaseAuth);
    router.push('/');
  };

  const widthClass = isCollapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <aside
      className={[
        'group/sb relative flex flex-col h-full',
        'bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl',
        'border-r border-[color:var(--ai-card-border)]',
        isMobile ? 'w-[280px]' : `${widthClass} transition-[width] duration-300 ease-out`,
      ].join(' ')}
    >
      {/* Brand row */}
      <div
        className={[
          'flex items-center gap-2.5 h-16 px-4 border-b border-[color:var(--ai-card-border)]',
          isCollapsed ? 'justify-center px-0' : '',
        ].join(' ')}
      >
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0" onClick={() => setMobileOpen(false)}>
          <div className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] grid place-items-center shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)]">
            <IconSparkles className="text-white" size={18} />
            <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-[color:var(--ai-success,#22c55e)] border-2 border-[color:var(--ai-card-bg)]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[color:var(--ai-foreground)] leading-tight truncate">
                StudiAI
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--ai-muted)]">
                Admin Console
              </div>
            </div>
          )}
        </Link>

        {!isMobile && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={[
              'ml-auto h-7 w-7 grid place-items-center rounded-lg',
              'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]',
              'hover:bg-[color:var(--ai-primary)]/10 transition',
              isCollapsed ? 'absolute -right-3 top-5 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] shadow-md' : '',
            ].join(' ')}
          >
            <IconChevronLeft className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} size={14} />
          </button>
        )}
      </div>

      {/* Quick search trigger */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-lg bg-[color:var(--ai-background)]/60 border border-[color:var(--ai-card-border)] text-xs text-[color:var(--ai-muted)] hover:border-[color:var(--ai-primary)]/40 hover:text-[color:var(--ai-foreground)] transition"
          >
            <span className="opacity-70">Quick jump…</span>
            <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[color:var(--ai-card-border)] text-[10px] font-medium">
              <IconCommand size={11} /> K
            </span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {ADMIN_NAV.map((group) => (
          <div key={group.id}>
            {!isCollapsed && (
              <div className="px-3 mb-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-[color:var(--ai-muted)]/70">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                const linkInner = (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'group relative flex items-center gap-3 h-10 rounded-lg px-3 text-sm transition-colors',
                      active
                        ? 'text-[color:var(--ai-primary)] bg-gradient-to-r from-[color:var(--ai-primary)]/12 to-[color:var(--ai-secondary)]/5 font-medium'
                        : 'text-[color:var(--ai-foreground)]/85 hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/6',
                      isCollapsed ? 'justify-center px-0' : '',
                    ].join(' ')}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                      />
                    )}
                    <span className={['shrink-0', active ? '' : 'opacity-80 group-hover:opacity-100'].join(' ')}>
                      <Icon className="" size={18} />
                    </span>
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <Chip size="sm" variant="flat" color="primary" className="h-5 text-[10px]">
                        {item.badge}
                      </Chip>
                    )}
                  </Link>
                );
                return (
                  <li key={item.id}>
                    {isCollapsed ? (
                      <Tooltip content={item.label} placement="right" delay={200}>
                        {linkInner}
                      </Tooltip>
                    ) : (
                      linkInner
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card / sign out */}
      <div className={['border-t border-[color:var(--ai-card-border)] p-3', isCollapsed ? 'px-2' : ''].join(' ')}>
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Tooltip content={user?.email ?? 'Admin'} placement="right">
                {user?.photoURL ? (
                  <Avatar src={user.photoURL} className="w-9 h-9" />
                ) : (
                  <DefaultAvatar name={user?.displayName || user?.email || 'A'} size={36} />
                )}
              </Tooltip>
              <Tooltip content="Sign out" placement="right">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-9 w-9 grid place-items-center rounded-lg text-[color:var(--ai-error,#ef4444)] hover:bg-[color:var(--ai-error,#ef4444)]/10 transition"
                  aria-label="Sign out"
                >
                  <FiLogOut className="" />
                </button>
              </Tooltip>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-[color:var(--ai-primary)]/5 transition"
            >
              {user?.photoURL ? (
                <Avatar src={user.photoURL} className="w-9 h-9 shrink-0" />
              ) : (
                <DefaultAvatar name={user?.displayName || user?.email || 'A'} size={36} />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[color:var(--ai-foreground)] truncate">
                  {user?.displayName || user?.email?.split('@')[0]}
                </div>
                <div className="text-[11px] text-[color:var(--ai-muted)] truncate">{user?.email}</div>
              </div>
              <Tooltip content="Sign out" placement="top">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-8 w-8 grid place-items-center rounded-lg text-[color:var(--ai-muted)] hover:text-[color:var(--ai-error,#ef4444)] hover:bg-[color:var(--ai-error,#ef4444)]/10 transition"
                  aria-label="Sign out"
                >
                  <FiLogOut size={16} />
                </button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default AdminSidebarNew;
