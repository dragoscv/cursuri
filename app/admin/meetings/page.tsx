'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { AppButton } from '@/components/shared/ui';

const AdminMeetings = dynamic(() => import('@/components/Admin/Meetings/AdminMeetings'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]" />
    </div>
  ),
  ssr: false,
});

export default function AdminMeetingsPage() {
  const t = useTranslations('meetings.admin.list');
  return (
    <>
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Link href="/admin/meetings/settings">
            <AppButton variant="secondary" size="md">
              {t('settings')}
            </AppButton>
          </Link>
        }
      />
      <AdminMeetings />
    </>
  );
}
