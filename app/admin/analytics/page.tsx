'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

// Dynamic import for AdminAnalytics to reduce initial bundle size
const AdminAnalytics = dynamic(() => import('@/components/Admin/AdminAnalytics'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]"></div>
    </div>
  ),
  ssr: false,
});

export default function AnalyticsPage() {
  const t = useTranslations('admin.analytics');

  return (
    <>
      <AdminPageHeader title={t('title')} description={t('description')} />
      <AdminAnalytics />
    </>
  );
}
