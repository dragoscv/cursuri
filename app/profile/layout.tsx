'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppContext } from '@/components/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSidebar from '@/components/Profile/ProfileSidebar';
import { useTranslations } from 'next-intl';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const context = useContext(AppContext);
  const t = useTranslations('common');

  if (!context) {
    throw new Error('AppContext not found');
  }

  const { user, authLoading } = context;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, router, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--ai-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--ai-card-border)]/40" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[color:var(--ai-primary)] animate-spin" />
          </div>
          <span className="text-sm text-[color:var(--ai-muted)]">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--ai-background)]">
      {/* Subtle ambient background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[480px] -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[420px] h-[420px] bg-[color:var(--ai-primary)]/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-[360px] h-[360px] bg-[color:var(--ai-secondary)]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <ProfileSidebar />
          </div>

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
