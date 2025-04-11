'use client'

import React from 'react';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

export default function AdminPage() {
    return (
        <>
            <AdminPageHeader 
                title="Admin Dashboard"
                description="Overview of your platform's key metrics and activities."
            />
            <AdminDashboard />
        </>
    );
}
