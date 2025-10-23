'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import AdminSettings from '@/components/Admin/AdminSettings';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

export default function SettingsPage() {
  const t = useTranslations('admin.settings');

  return (
    <>
      <AdminPageHeader title={t('title')} description={t('pageDescription')} />
      <AdminSettings />
    </>
  );
}
