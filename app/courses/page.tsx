import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

// Dynamically import client components
const CoursesPage = dynamic(() => import('@/components/Courses/CoursesPage'), {
  ssr: true,
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-12 bg-[color:var(--ai-card-border)]/50 rounded-md mb-8"></div>
        <div className="h-16 bg-[color:var(--ai-card-border)]/50 rounded-md mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-[color:var(--ai-card-border)]/50 rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('courses.metadata');
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', ')
  };
}

export default function Page() {
  return <CoursesPage />;
}