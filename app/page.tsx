import Image from 'next/image'
import Courses from '@/components/Courses'
import HeroSection from '@/components/HeroSection'
import FeaturedReviews from '@/components/FeaturedReviews'
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
      <div id="courses-section" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Available Courses
        </h2>
        <Courses />
      </div>

      {/* Why choose us section with parallax effect */}
      <WhyChooseUsSection />

      {/* Featured reviews section */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <FeaturedReviews />
      </div>

      {/* Call to action section */}
      <CallToActionSection />
    </main>
  )
}
