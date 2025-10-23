'use client';

import React, { useContext, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
// import { useAuth, useModal } from '@/components/contexts/hooks/index'
import { AppContext } from '@/components/AppContext';
import Login from '@/components/Login';
import ParticlesAnimation from './ParticlesAnimation';
import TechIcons from './TechIcons';
import { useHeroStats } from './hooks/useHeroStats';

const HeroSection = React.memo(function HeroSection() {
  const router = useRouter();
  const t = useTranslations('home.hero');

  // Inline useAuth to bypass caching issue
  const context = useContext(AppContext);
  console.log('HeroSection: AppContext =', !!context, context?.user, context?.authLoading);
  const user = context?.user || null;
  const { openModal, closeModal } = context || {};

  // const { user } = useAuth()
  // const { openModal, closeModal } = useModal()
  const stats = useHeroStats();

  // Memoize animation props to prevent recreation
  const heroAnimationProps = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 },
    }),
    []
  );

  const statsAnimateProps = useMemo(
    () => ({
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
    }),
    []
  );

  const handleGetStarted = () => {
    if (!user) {
      if (openModal && closeModal) {
        openModal({
          id: 'login',
          isOpen: true,
          hideCloseButton: false,
          backdrop: 'blur',
          size: 'full',
          scrollBehavior: 'inside',
          isDismissable: true,
          modalHeader: t('buttons.login'),
          modalBody: <Login onClose={() => closeModal('login')} />,
          headerDisabled: true,
          footerDisabled: true,
          noReplaceURL: true,
          onClose: () => closeModal('login'),
        });
      }
    } else {
      // Smooth scroll to courses section
      const coursesSection = document.getElementById('courses-section');
      coursesSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-[color:var(--ai-background)] dark:via-[color:var(--ai-card-bg)] dark:to-[color:var(--ai-background)] overflow-hidden">
      {/* Particle animation */}
      <ParticlesAnimation />

      {/* Tech stack icons */}
      <TechIcons technologies={stats.topTechnologies} />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <pattern
            id="circuit-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="20" height="20" fill="none" />
            <path d="M10,0 L10,10 M0,10 L20,10" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="10" cy="10" r="2" fill="currentColor" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
      </div>

      {/* Hero content */}
      <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center min-h-[80vh] relative z-10">
        <motion.div {...heroAnimationProps} className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {' '}
              {t('titleHighlight')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 dark:text-[color:var(--ai-muted-foreground)] mb-8 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button
              onClick={handleGetStarted}
              size="lg"
              color="primary"
              variant="solid"
              className="px-8 py-6"
            >
              {t('button')}
            </Button>

            <Button
              onClick={() => {
                const techStackSection = document.getElementById('tech-stack-section');
                techStackSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              size="lg"
              color="secondary"
              variant="ghost"
              className="px-8 py-6 border border-white/30 dark:border-[color:var(--ai-card-border)] text-white"
            >
              {t('exploreButton')}
            </Button>
          </div>

          {/* Stats display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 dark:bg-[color:var(--ai-card-bg)]/30 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalCourses}+</div>
              <div className="text-white/60 dark:text-[color:var(--ai-muted-foreground)] text-sm">
                {t('floatingStats.courses')}
              </div>
            </div>

            <div className="bg-white bg-opacity-10 dark:bg-[color:var(--ai-card-bg)]/30 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {stats.totalStudents}+
              </div>
              <div className="text-white/60 dark:text-[color:var(--ai-muted-foreground)] text-sm">
                {t('floatingStats.students')}
              </div>
            </div>

            <div className="bg-white bg-opacity-10 dark:bg-[color:var(--ai-card-bg)]/30 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalReviews}+</div>
              <div className="text-white/60 dark:text-[color:var(--ai-muted-foreground)] text-sm">
                {t('floatingStats.reviews')}
              </div>
            </div>

            <div className="bg-white bg-opacity-10 dark:bg-[color:var(--ai-card-bg)]/30 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.avgRating}</div>
              <div className="text-white/60 dark:text-[color:var(--ai-muted-foreground)] text-sm">
                {t('floatingStats.rating')}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default HeroSection;
