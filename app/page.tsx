import type { Metadata } from 'next';
import AvailableCoursesSection from '@/components/AvailableCoursesSection';
import HeroSection from '@/components/HeroSection';
import FeaturedReviewsSection from '@/components/FeaturedReviewsSection';
import TechStackSection from '@/components/TechStackSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import LearningPathSection from '@/components/LearningPathSection';
import StatisticsSection from '@/components/StatisticsSection';
import CallToActionSection from '@/components/CallToActionSection';
import FeaturedCoursesSection from '@/components/FeaturedCoursesSection';
import RecommendedCoursesSection from '@/components/RecommendedCoursesSection';
import SubscriptionSection from '@/components/Home/SubscriptionSection';
import { constructMetadata } from '@/utils/metadata';
import { getTranslations } from 'next-intl/server';

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
    <main className="flex flex-col items-center justify-start w-full">
      {/* Hero section with animated background */}
      <HeroSection />

      {/* Recommended courses section */}
      <RecommendedCoursesSection />

      {/* Statistics section showing platform metrics */}
      <StatisticsSection />

      {/* Tech stack showcase */}
      <TechStackSection />

      {/* Learning path showcasing the journey */}
      <LearningPathSection />

      {/* Featured Courses section */}
      {/* <FeaturedCoursesSection /> */}

      {/* Subscription plans section */}
      <SubscriptionSection />

      {/* Courses section with ID for scroll targeting */}
      <AvailableCoursesSection />

      {/* Instructor highlights section */}
      {/* <InstructorHighlightsSection /> */}

      {/* Why choose us section with parallax effect */}
      <WhyChooseUsSection />

      {/* Featured reviews section */}
      <FeaturedReviewsSection />

      {/* Call to action section */}
      <CallToActionSection />
    </main>
  );
}
