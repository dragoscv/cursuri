'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const UserDetailView = dynamic(() => import('@/components/Admin/UserDetailView'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--ai-primary)]"></div>
    </div>
  ),
  ssr: false,
});

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;

  if (!userId) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--ai-muted-foreground)]">User ID is missing</p>
      </div>
    );
  }

  return <UserDetailView userId={userId} />;
}
