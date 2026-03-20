'use client';

import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import ScrollAnimationWrapper from './animations/ScrollAnimationWrapper';
import { useContext } from 'react';
import { AppContext } from './AppContext';
import { useTranslations } from 'next-intl';

const CallToActionSection = memo(function CallToActionSection() {
  const t = useTranslations('home.cta');
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }

  const { openModal, closeModal, user } = context;

  // Memoize hover/tap animation props
  const buttonHoverProps = useMemo(
    () => ({
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
    }),
    []
  );

  // Pre-calculate grid opacity values to avoid hydration mismatch
  const gridOpacities = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      // Deterministic opacity calculation with fixed precision
      return (0.1 + (Math.sin(i * 0.1) * 0.15 + 0.25)).toFixed(5);
    });
  }, []);

  // Pre-calculate floating orbs properties with animation configs
  const floatingOrbs = useMemo(() => {
    // Use a seeded random function for consistent values between server and client
    const seededRandom = (seed: number): number => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 6 }).map((_, i) => {
      // Use index as seed for deterministic randomness
      const widthSeed = i * 3.1;
      const heightSeed = i * 4.2;
      const topSeed = i * 5.3;
      const leftSeed = i * 6.4;
      const xMoveSeed = i * 7.5;
      const yMoveSeed = i * 8.6;
      const durationSeed = i * 9.7;

      const xMove = seededRandom(xMoveSeed) * 50 - 25;
      const yMove = seededRandom(yMoveSeed) * 50 - 25;
      const duration = 5 + seededRandom(durationSeed) * 5;

      // Use fixed string values for ALL properties to prevent hydration mismatches
      return {
        key: i,
        width: (seededRandom(widthSeed) * 200 + 50).toFixed(4),
        height: (seededRandom(heightSeed) * 200 + 50).toFixed(4),
        top: (seededRandom(topSeed) * 100).toFixed(4),
        left: (seededRandom(leftSeed) * 100).toFixed(4),
        // Pre-compute animation objects to avoid recreation
        animate: {
          x: [0, xMove],
          y: [0, yMove],
        },
        transition: {
          duration: duration,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: 'easeInOut' as const,
        },
      };
    });
  }, []);

  const handleGetStarted = () => {
    if (!user) {
      openModal({
        id: 'login',
        isOpen: true,
        hideCloseButton: false,
        backdrop: 'blur',
        size: 'full',
        scrollBehavior: 'inside',
        isDismissable: true,
        modalHeader: t('buttons.login'),
        modalBody: <div>Login Component</div>,
        headerDisabled: true,
        footerDisabled: true,
        noReplaceURL: true,
        onClose: () => closeModal('login'),
      });
    } else {
      // Smooth scroll to courses section
      const coursesSection = document.getElementById('courses-section');
      coursesSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]" />

      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Floating glow orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <ScrollAnimationWrapper>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {t('title')}
            </h2>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper delay={0.1}>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">{t('subtitle')}</p>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper delay={0.2}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                color="primary"
                size="lg"
                radius="full"
                className="px-10 py-6 text-base font-semibold bg-white text-[color:var(--ai-primary)] hover:bg-white/90 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleGetStarted}
              >
                {t('button')}
              </Button>

              <Button
                variant="secondary"
                color="secondary"
                size="lg"
                radius="full"
                className="px-10 py-6 text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => {
                  const coursesSection = document.getElementById('courses-section');
                  coursesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('button')}
              </Button>
            </div>
          </ScrollAnimationWrapper>

          {/* Trust badges */}
          <ScrollAnimationWrapper delay={0.3}>
            <div className="mt-14 flex flex-wrap justify-center items-center gap-8">
              <div className="text-white/80 flex items-center text-sm">
                <svg className="w-5 h-5 mr-2 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('benefits.moneyBack')}</span>
              </div>
              <div className="text-white/80 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('benefits.lifetimeAccess')}</span>
              </div>
              <div className="text-white/80 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('benefits.certificate')}</span>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
});

export default CallToActionSection;
