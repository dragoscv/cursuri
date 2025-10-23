import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

// Dynamic import for AdminDashboard to reduce initial bundle size
const AdminDashboard = dynamic(() => import('@/components/Admin/AdminDashboard'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]"></div>
    </div>
  ),
  ssr: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.dashboard');
  return {
    title: `${t('title')} | Cursuri`,
    description: t('overview'),
  };
}

export default async function AdminPage() {
  const t = await getTranslations('admin.dashboard');

  return (
    <>
      <AdminPageHeader title={t('title')} description={t('overview')} />
      <AdminDashboard />
    </>
  );
}
