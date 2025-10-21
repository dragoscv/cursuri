import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

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
            <AdminPageHeader 
                title={t('title')}
                description={t('overview')}
            />
            <AdminDashboard />
        </>
    );
}
