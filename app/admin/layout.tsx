'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AppContext } from '@/components/AppContext';
import { AdminShell } from '@/components/Admin/shell';
import { ContextMenuProvider } from '@/components/ui/ContextMenu';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTranslations('common');

  const authLoading = context?.authLoading ?? true;
  const isAdmin = context?.isAdmin || false;
  const user = context?.user || null;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [authLoading, user, isAdmin, router]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[color:var(--ai-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--ai-card-border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[color:var(--ai-primary)] animate-spin" />
          </div>
          <div className="text-sm text-[color:var(--ai-muted)] animate-pulse">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <ContextMenuProvider>
      <AdminShell>{children}</AdminShell>
    </ContextMenuProvider>
  );
}
