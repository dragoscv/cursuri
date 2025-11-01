import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import RecommendedCoursesSection from '@/components/RecommendedCoursesSection';
import SectionSkeleton from '@/components/shared/SectionSkeleton';
import { constructMetadata } from '@/utils/metadata';
import { getTranslations } from 'next-intl/server';

// Dynamic imports for below-fold sections to improve LCP
const StatisticsSection = dynamic(() => import('@/components/StatisticsSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-96" className="bg-gradient-to-b from-transparent to-[color:var(--ai-secondary)]/5" />
});

const TechStackSection = dynamic(() => import('@/components/TechStackSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-64" />
});

const LearningPathSection = dynamic(() => import('@/components/LearningPathSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-96" />
});

const SubscriptionSection = dynamic(() => import('@/components/Home/SubscriptionSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-96" />
});

const AvailableCoursesSection = dynamic(() => import('@/components/AvailableCoursesSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-96" />
});

const WhyChooseUsSection = dynamic(() => import('@/components/WhyChooseUsSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-96" />
});

const FeaturedReviewsSection = dynamic(() => import('@/components/FeaturedReviewsSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-96" />
});

const CallToActionSection = dynamic(() => import('@/components/CallToActionSection'), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-64" />
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home.metadata');

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', '),
  });
}

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-start w-full">
      {/* Hero section with animated background - Critical above-the-fold content */}
      <HeroSection />

      {/* Recommended courses section - Critical above-the-fold content */}
      <RecommendedCoursesSection />

      {/* Below-the-fold sections with progressive loading for better LCP */}
      <Suspense fallback={<SectionSkeleton height="h-96" className="bg-gradient-to-b from-transparent to-[color:var(--ai-secondary)]/5" />}>
        <StatisticsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <TechStackSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <LearningPathSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <SubscriptionSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <AvailableCoursesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <WhyChooseUsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <FeaturedReviewsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <CallToActionSection />
      </Suspense>
    </main>
  );
}
