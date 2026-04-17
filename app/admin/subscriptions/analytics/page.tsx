'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { AppButton } from '@/components/shared/ui';
import { FiSettings } from '@/components/icons/FeatherIcons';

const SubscriptionAnalytics = dynamic(
    () => import('@/components/Admin/SubscriptionAnalytics'),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]" />
            </div>
        ),
    }
);

export default function SubscriptionAnalyticsPage() {
    const t = useTranslations('admin.subscriptionAnalytics');
    return (
        <>
            <AdminPageHeader
                title={t('title')}
                description={t('description')}
                actions={
                    <Link href="/admin/subscriptions">
                        <AppButton
                            variant="primary"
                            size="sm"
                            startContent={<FiSettings size={14} />}
                        >
                            {t('manageProducts')}
                        </AppButton>
                    </Link>
                }
            />
            <SubscriptionAnalytics />
        </>
    );
}
