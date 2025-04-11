'use client'

import React from 'react';
import AdminUsers from '@/components/Admin/AdminUsers';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

export default function UsersPage() {
    return (
        <>
            <AdminPageHeader
                title="User Management"
                description="View and manage user accounts, permissions, and course enrollments."
            />
            <AdminUsers />
        </>
    );
}
