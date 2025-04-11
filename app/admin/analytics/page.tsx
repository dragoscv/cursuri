'use client'

import React from 'react';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

export default function AnalyticsPage() {
    return (
        <>
            <AdminPageHeader
                title="Analytics & Insights"
                description="Detailed analytics on course enrollments, user engagement, and platform performance."
            />
            <AdminAnalytics />
        </>
    );
}
