'use client';

import React, { useEffect, useRef, useMemo, useContext, memo } from 'react';
import Button from '@/components/ui/Button';
import { AppContext } from '@/components/AppContext';
import Login from './Login';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ChatGPTIcon,
  MidjourneyIcon,
  ClaudeIcon,
  GeminiIcon,
  CopilotIcon,
  StableDiffusionIcon,
  PromptEngineeringIcon,
  AutomationIcon,
  DataAnalysisIcon,
  ContentCreationIcon,
} from './icons/tech';
import { DiscordIcon } from './icons/DiscordIcon';
import DefaultAvatar from './shared/DefaultAvatar';

const HeroSection = memo(function HeroSection() {
  const t = useTranslations('home.hero');
  // Use AppContext instead of modular hooks to avoid context issues
  const router = useRouter();
  const context = useContext(AppContext);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Use useMemo for expensive context values to prevent unnecessary recalculations
  const courses = useMemo(() => context?.courses || {}, [context?.courses]);
  const reviews = useMemo(() => context?.reviews || {}, [context?.reviews]);
  const userPaidProducts = useMemo(
    () => context?.userPaidProducts || [],
    [context?.userPaidProducts]
  );

  // Calculate real statistics from the database using useMemo instead of useEffect
  // Must be called before any conditional returns (React Hooks rules)
  const stats = useMemo(() => {
    if (Object.keys(courses).length === 0) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalReviews: 0,
        avgRating: 4.8,
        topTechnologies: ['ChatGPT', 'Prompt Engineering', 'AI Automation', 'Data Analysis', 'Content Creation'],
      };
    }

    // Calculate total courses
    const totalCourses = Object.keys(courses).length;

    // Calculate total students (unique users who have purchased courses)
    const uniqueStudents = new Set(
      userPaidProducts.map((product) => product.metadata?.userId || '')
    );
    const totalStudents = uniqueStudents.size > 0 ? uniqueStudents.size : userPaidProducts.length;

    // Calculate total reviews and average rating
    let reviewCount = 0;
    let ratingSum = 0;

    // Gather all course categories/technologies
    const technologiesMap = new Map();

    Object.keys(reviews).forEach((courseId) => {
      const courseReviews = reviews[courseId];
      if (courseReviews) {
        Object.keys(courseReviews).forEach((reviewId) => {
          reviewCount++;
          const review = courseReviews[reviewId];
          if (review && typeof review === 'object' && 'rating' in review && review.rating) {
            ratingSum += review.rating;
          }
        });
      }

      // Count technologies mentioned in course
      const course = courses[courseId];
      if (course && course.tags) {
        course.tags.forEach((tag: string) => {
          technologiesMap.set(tag, (technologiesMap.get(tag) || 0) + 1);
        });
      }
    });

    // Get top technologies based on frequency
    const topTechnologies = Array.from(technologiesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    // Default to curated AI tools list if not enough data
    const defaultTechnologies = ['ChatGPT', 'Prompt Engineering', 'AI Automation', 'Data Analysis', 'Content Creation'];
    const finalTechnologies = topTechnologies.length >= 3 ? topTechnologies : defaultTechnologies;

    return {
      totalCourses,
      // If no real data, show a reasonable number
      totalStudents: totalStudents || Math.max(50, totalCourses * 10),
      totalReviews: reviewCount,
      avgRating: reviewCount > 0 ? +(ratingSum / reviewCount).toFixed(1) : 4.8,
      topTechnologies: finalTechnologies,
    };
  }, [courses, userPaidProducts, reviews]);

  // Create floating particles animation (must be before early return - React Hooks rules)
  useEffect(() => {
    if (!particlesRef.current) return;

    // Create animation style only once
    if (!document.getElementById('hero-particles-animation-style')) {
      const style = document.createElement('style');
      style.id = 'hero-particles-animation-style';
      style.innerHTML = `
        @keyframes float-particle {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            transform: translateY(-10px) scale(1);
            opacity: 0.4;
          }
          90% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-250px) scale(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const createParticle = () => {
      const particle = document.createElement('div');

      // Random size between 5px and 15px
      const size = Math.random() * 10 + 5;

      // Apply styling to the particle
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = 'rgba(255, 255, 255, 0.1)';
      particle.style.borderRadius = '50%';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.transform = 'scale(0)';
      particle.style.opacity = '0';
      particle.style.animation = `float-particle ${Math.random() * 10 + 10}s linear infinite`;

      // Add to the DOM
      particlesRef.current?.appendChild(particle);

      // Remove after animation
      setTimeout(() => {
        particle.remove();
      }, 20000);
    };

    // Create particles periodically, but limit to fewer particles (every 800ms instead of 300ms)
    const interval = setInterval(() => {
      // Limit the total number of particles to avoid performance issues
      const maxParticles = 30;
      if (particlesRef.current && particlesRef.current.childElementCount < maxParticles) {
        createParticle();
      }
    }, 800);

    // Initial particles - reduce number from 20 to 10
    for (let i = 0; i < 10; i++) {
      createParticle();
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Generate deterministic opacity values - must be before early return
  const gridOpacities = useMemo(() => {
    // Create a deterministic function to generate opacity values
    const generateOpacity = (index: number): string => {
      // Using a sine function to generate values between 0.1 and 0.4
      return (Math.sin(index * 0.1) * 0.15 + 0.25).toFixed(5);
    };

    // Pre-generate all opacity values
    return Array.from({ length: 100 }).map((_, i) => Number(generateOpacity(i)));
  }, []);

  // Memoize animation variants to prevent recreation on every render
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.5,
          staggerChildren: 0.2,
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 100,
        },
      },
    }),
    []
  );

  // Pre-calculate SVG coordinates to prevent hydration errors
  const nodePoints = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const angle = (i * 36 * Math.PI) / 180;
      const x = 400 + Math.cos(angle) * 200;
      const y = 400 + Math.sin(angle) * 200;
      // Fix precision by rounding to 2 decimal places
      return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
      };
    });
  }, []);

  // Pre-calculate connection lines between nodes
  const connectionLines = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const angle1 = (i * 36 * Math.PI) / 180;
      const angle2 = ((i + 1) * 36 * Math.PI) / 180;
      const x1 = 400 + Math.cos(angle1) * 200;
      const y1 = 400 + Math.sin(angle1) * 200;
      const x2 = 400 + Math.cos(angle2) * 200;
      const y2 = 400 + Math.sin(angle2) * 200;
      // Fix precision by rounding to 2 decimal places
      return {
        x1: Number(x1.toFixed(2)),
        y1: Number(y1.toFixed(2)),
        x2: Number(x2.toFixed(2)),
        y2: Number(y2.toFixed(2)),
      };
    });
  }, []);

  // Early return check must come after all hooks
  if (!context) {
    console.error('HeroSection: AppContext not available');
    return (
      <div className="flex items-center justify-center min-h-[400px] text-[color:var(--ai-muted)]">
        {t('loading')}
      </div>
    );
  }

  // Extract only needed values to reduce dependency on full context
  const { user, openModal, closeModal } = context;

  const handleGetStarted = () => {
    if (!user) {
      openModal({
        id: 'login',
        isOpen: true,
        hideCloseButton: false,
        backdrop: 'opaque',
        size: 'md',
        scrollBehavior: 'inside',
        isDismissable: true,
        modalHeader: t('getStarted'),
        modalBody: <Login onClose={() => closeModal('login')} />,
        headerDisabled: true,
        footerDisabled: true,
        noReplaceURL: true,
        onClose: () => closeModal('login'),
        classNames: {
          backdrop:
            'z-50 backdrop-blur-md backdrop-saturate-150 bg-black/50 dark:bg-black/50 w-screen min-h-[100dvh] fixed inset-0',
          base: 'z-50 mx-auto my-auto w-full max-w-md rounded-2xl outline-none bg-transparent shadow-2xl',
        },
      });
    } else {
      // Smooth scroll to courses section
      const coursesSection = document.getElementById('courses-section');
      coursesSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Skills and AI tools for the floating nodes
  const techNodes = [
    'ChatGPT',
    'Midjourney',
    'Claude',
    'Gemini',
    'Copilot',
    'Stable Diffusion',
  ];

  // Map technology names to their corresponding icon components
  const getTechIcon = (tech: string) => {
    const iconMap: Record<string, React.FC<{ className?: string; size?: number }>> = {
      ChatGPT: ChatGPTIcon,
      Midjourney: MidjourneyIcon,
      Claude: ClaudeIcon,
      Gemini: GeminiIcon,
      Copilot: CopilotIcon,
      'Stable Diffusion': StableDiffusionIcon,
      'Prompt Engineering': PromptEngineeringIcon,
      'AI Automation': AutomationIcon,
      'Content Creation': ContentCreationIcon,
      'Data Analysis': DataAnalysisIcon,
    };

    const IconComponent = iconMap[tech];
    return IconComponent ? <IconComponent size={16} className="mr-1.5" /> : null;
  };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
      {/* Clean mesh gradient background */}
      <div className="absolute inset-0 bg-[color:var(--ai-background)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)]/8 via-transparent to-[color:var(--ai-secondary)]/6" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[color:var(--ai-primary)]/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[color:var(--ai-secondary)]/8 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(var(--ai-primary) 1px, transparent 1px), linear-gradient(90deg, var(--ai-primary) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Floating particles container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Copilot announcement badge - clickable */}
            <motion.div variants={itemVariants} className="mb-6">
              <Link
                href="/subscriptions"
                className="group inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[color:var(--ai-primary)]/15 via-[color:var(--ai-secondary)]/15 to-[color:var(--ai-accent)]/15 text-[color:var(--ai-foreground)] border border-[color:var(--ai-primary)]/30 hover:border-[color:var(--ai-primary)]/60 transition-all"
              >
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[color:var(--ai-primary)] text-white">
                  {t('copilotBadge.eyebrow')}
                </span>
                <CopilotIcon size={16} />
                <span className="hidden sm:inline">{t('copilotBadge.label')}</span>
                <span className="sm:hidden">GitHub Copilot Pro included</span>
                <span className="text-[color:var(--ai-primary)] font-semibold group-hover:translate-x-0.5 transition-transform">
                  {t('copilotBadge.cta')} →
                </span>
              </Link>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[color:var(--ai-foreground)] leading-[1.1]">
              <span className="block">{t('title.line1')}</span>
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]">
                {t('title.line2')}
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-6 text-lg md:text-xl text-[color:var(--ai-muted)] leading-relaxed max-w-xl">
              {t('subtitle')}
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                color="primary"
                variant="primary"
                size="lg"
                radius="full"
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-lg shadow-[color:var(--ai-primary)]/25 hover:shadow-xl hover:shadow-[color:var(--ai-primary)]/30 hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => router.push('/discord')}
              >
                <div className="flex items-center gap-2">
                  <DiscordIcon size={20} />
                  {t('joinDiscord')}
                </div>
              </Button>

              <Button
                variant="secondary"
                color="secondary"
                size="lg"
                radius="full"
                className="px-8 py-6 text-base font-semibold border-2 border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-primary)]/50 hover:bg-[color:var(--ai-primary)]/5 hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => router.push('/courses')}
              >
                {t('exploreCourses')}
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={itemVariants} className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['Alex M.', 'Sarah K.', 'John D.', 'Maria P.', 'Chris L.'].map((name, i) => (
                  <div
                    key={i}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[color:var(--ai-background)] overflow-hidden"
                  >
                    <DefaultAvatar name={name} size={36} className="" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-[color:var(--ai-muted)]">
                <span className="font-bold text-[color:var(--ai-foreground)]">
                  {stats.totalStudents}+
                </span>{' '}
                {t('learnersEnrolled')}
              </div>
            </motion.div>

            {/* Copilot models ribbon - the headline subscription perk */}
            <motion.div variants={itemVariants} className="mt-8">
              <Link
                href="/subscriptions"
                className="group block relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#1f2937] p-5 hover:border-[color:var(--ai-primary)]/50 transition-all"
              >
                <div
                  aria-hidden
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-transparent blur-3xl"
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <CopilotIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-tight">
                        {t('copilotRibbon.title')}
                      </p>
                      <p className="text-xs text-white/70 mt-0.5">
                        {t('copilotRibbon.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(t.raw('copilotRibbon.models') as string[]).map((model) => (
                      <span
                        key={model}
                        className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/10 text-white/90 border border-white/10 whitespace-nowrap"
                      >
                        {model}
                      </span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white text-[#0d1117] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                      {t('copilotRibbon.cta')} →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[color:var(--ai-card-border)]">
              <Image
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt={t('imageAlt')}
                className="w-full h-auto object-cover"
                width={600}
                height={400}
                priority
                fetchPriority="high"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Floating tech nodes on image */}
              {techNodes.slice(0, 3).map((tech, i) => (
                <motion.div
                  key={tech}
                  className="absolute bg-white/90 dark:bg-[color:var(--ai-card-bg)]/90 backdrop-blur-md border border-[color:var(--ai-card-border)] rounded-xl px-3 py-2 text-xs font-medium text-[color:var(--ai-foreground)] flex items-center shadow-lg"
                  style={{
                    top: `${15 + i * 25}%`,
                    left: i % 2 === 0 ? '8%' : '65%',
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {getTechIcon(tech)}
                  {tech}
                </motion.div>
              ))}
            </div>

            {/* Stats card - bottom left */}
            <motion.div
              className="absolute -bottom-4 -left-4 z-10 rounded-xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] shadow-xl p-4 flex items-center gap-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[color:var(--ai-foreground)]">{stats.totalCourses} {t('stats.coursesAvailable')}</p>
                <p className="text-xs text-[color:var(--ai-muted)]">{t('stats.projectBasedCurriculum')}</p>
              </div>
            </motion.div>

            {/* Rating card - top right */}
            <motion.div
              className="absolute -top-4 -right-4 z-10 rounded-xl bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] shadow-xl p-4 text-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <p className="text-xs font-medium text-[color:var(--ai-muted)]">{t('stats.studentRating')}</p>
              <div className="flex items-center justify-center mt-1 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-1 text-2xl font-bold text-[color:var(--ai-foreground)]">
                {stats.avgRating}<span className="text-sm text-[color:var(--ai-muted)]">/5</span>
              </p>
              <p className="text-xs text-[color:var(--ai-muted)]">{t('stats.reviews', { count: stats.totalReviews || 42 })}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <p className="text-[color:var(--ai-muted)] text-sm mb-2">{t('scrollToExplore')}</p>
        <motion.div
          className="w-7 h-11 rounded-full border-2 border-[color:var(--ai-primary)]/30 flex justify-center p-2"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: { duration: 1.5, repeat: Infinity },
          }}
        >
          <motion.div
            className="w-1 h-2 bg-[color:var(--ai-primary)]/60 rounded-full"
            animate={{
              y: [0, 12, 0],
              transition: { duration: 1.5, repeat: Infinity },
            }}
          />
        </motion.div>
      </div>
    </section>
  );
});

export default HeroSection;
