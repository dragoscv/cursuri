'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

const SubscriptionsManager = dynamic(
    () => import('@/components/Admin/SubscriptionsManager'),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]" />
            </div>
        ),
    }
);

export default function AdminSubscriptionsPage() {
    const t = useTranslations('admin.subscriptions');
    return (
        <>
            <AdminPageHeader title={t('title')} description={t('description')} />
            <SubscriptionsManager />
        </>
    );
}
