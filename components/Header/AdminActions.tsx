'use client';

/**
 * AdminActions v2 — compact admin-only entry point to /admin. No
 * commented-out dead code, single small ghost button matching the icon
 * rail height (h-8).
 */

import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AppContext } from '@/components/AppContext';

export default function AdminActions() {
  const context = useContext(AppContext);
  const router = useRouter();
  const t = useTranslations('common');

  if (!context) throw new Error('Missing context value');
  const { isAdmin } = context;
  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => router.push('/admin')}
      title={t('nav.admin')}
      aria-label={t('nav.admin')}
      className="inline-flex items-center h-8 px-2.5 text-[12px] font-medium uppercase tracking-[0.06em] rounded-md text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/10 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)] cursor-pointer"
    >
      Admin
    </button>
  );
}
