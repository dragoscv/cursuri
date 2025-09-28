import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { constructMetadata } from '@/utils/metadata';

// Dynamically import client components
const CoursesPage = dynamic(() => import('@/components/Courses/CoursesPage'), {
  ssr: true,
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-12 bg-[color:var(--ai-card-border)] rounded-md mb-8"></div>
        <div className="h-16 bg-[color:var(--ai-card-border)] rounded-md mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-[color:var(--ai-card-border)] rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

export const metadata: Metadata = constructMetadata({
  title: 'Online Courses',
  description: 'Browse our comprehensive catalog of online courses in programming, web development, AI, data science, and more. Learn at your own pace and advance your career.',
  keywords: [
    'online courses',
    'programming courses',
    'web development',
    'AI courses',
    'data science',
    'technology learning',
    'professional development',
    'coding classes',
    'learn to code',
    'tech education'
  ]
});

export default function Page() {
  return <CoursesPage />;
}