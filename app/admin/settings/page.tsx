'use client'

import React from 'react';
import AdminSettings from '@/components/Admin/AdminSettings';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

export default function SettingsPage() {
    return (
        <>
            <AdminPageHeader
                title="Platform Settings"
                description="Configure platform-wide settings, payment options, and notification preferences."
            />
            <AdminSettings />
        </>
    );
}
