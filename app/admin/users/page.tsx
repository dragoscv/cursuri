'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

// Dynamic import for AdminUsers to reduce initial bundle size
const AdminUsers = dynamic(() => import('@/components/Admin/AdminUsers'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]"></div>
    </div>
  ),
  ssr: false,
});

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
