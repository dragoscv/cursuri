import type { Metadata } from 'next'
import AvailableCoursesSection from '@/components/AvailableCoursesSection'
import HeroSection from '@/components/HeroSection'
import FeaturedReviewsSection from '@/components/FeaturedReviewsSection'
import TechStackSection from '@/components/TechStackSection'
import WhyChooseUsSection from '@/components/WhyChooseUsSection'
import LearningPathSection from '@/components/LearningPathSection'
import StatisticsSection from '@/components/StatisticsSection'
import CallToActionSection from '@/components/CallToActionSection'
import FeaturedCoursesSection from '@/components/FeaturedCoursesSection'
import RecommendedCoursesSection from '@/components/RecommendedCoursesSection'
import { constructMetadata } from '@/utils/metadata'

export const metadata: Metadata = constructMetadata({
  title: 'Home',
  description: 'Transform your career with expert-led online courses in AI, Machine Learning, Digital Marketing, Data Science, Cybersecurity, and more. Learn at your own pace with project-based curriculum.',
  keywords: [
    'online courses',
    'AI courses',
    'machine learning courses',
    'digital marketing',
    'data science',
    'cybersecurity training',
    'prompt engineering',
    'generative AI',
    'cloud computing',
    'business skills',
    'career development',
    'online learning platform'
  ]
});

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
      <FeaturedCoursesSection />

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
  )
}
