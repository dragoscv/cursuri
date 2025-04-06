import AvailableCoursesSection from '@/components/AvailableCoursesSection'
import HeroSection from '@/components/HeroSection'
import FeaturedReviewsSection from '@/components/FeaturedReviewsSection'
import TechStackSection from '@/components/TechStackSection'
import WhyChooseUsSection from '@/components/WhyChooseUsSection'
import LearningPathSection from '@/components/LearningPathSection'
import StatisticsSection from '@/components/StatisticsSection'
import CallToActionSection from '@/components/CallToActionSection'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start w-full">
      {/* Hero section with animated background */}
      <HeroSection />

      {/* Statistics section showing platform metrics */}
      <StatisticsSection />

      {/* Tech stack showcase */}
      <TechStackSection />

      {/* Learning path showcasing the journey */}
      <LearningPathSection />

      {/* Courses section with ID for scroll targeting */}
      <AvailableCoursesSection />

      {/* Why choose us section with parallax effect */}
      <WhyChooseUsSection />

      {/* Featured reviews section */}
      <FeaturedReviewsSection />

      {/* Call to action section */}
      <CallToActionSection />
    </main>
  )
}
