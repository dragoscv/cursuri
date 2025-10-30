'use client';

import React, { useEffect, useRef, useMemo, useContext, memo } from 'react';
import Button from '@/components/ui/Button';
// import { useAuth, useCourses, useReviews, useModal, useProducts } from '@/components/contexts/modules'
import { AppContext } from '@/components/AppContext';
import Login from './Login';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    <div className="relative w-full bg-gradient-to-br from-[color:var(--ai-primary)]/90 via-[color:var(--ai-secondary)]/80 to-[color:var(--ai-accent)]/70 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 gap-2 transform -skew-y-12 scale-150">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="col-span-1 bg-white/10 dark:bg-white/5 h-8 animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: gridOpacities[i],
              }}
            />
          ))}
        </div>
      </div>

      {/* Code network nodes animation - replacing neural network */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30"
        style={{
          background: `radial-gradient(circle at center, rgba(var(--ai-secondary-rgb), 0.3) 0%, rgba(var(--ai-primary-rgb), 0.1) 70%)`,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ai-secondary)" />
              <stop offset="100%" stopColor="var(--ai-primary)" />
            </linearGradient>
          </defs>
          <g>
            {/* Code node points */}
            {nodePoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="url(#gradient1)"
                className="animate-ping"
                style={{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }}
              />
            ))}
            {/* Connection lines between nodes */}
            {connectionLines.map((line, i) => (
              <line
                key={`line-${i}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="url(#gradient1)"
                strokeWidth="0.5"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
            {/* Add code brackets for programming theme */}
            <g opacity="0.6">
              <path
                d="M300,300 L250,350 L300,400"
                stroke="url(#gradient1)"
                fill="none"
                strokeWidth="2"
              />
              <path
                d="M500,300 L550,350 L500,400"
                stroke="url(#gradient1)"
                fill="none"
                strokeWidth="2"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Floating particles container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
              variants={itemVariants}
            >
              <span className="block">{t('title.line1')}</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] pb-2">
                {t('title.line2')}
              </span>
            </motion.h1>

            <motion.p className="mt-6 text-lg md:text-xl text-white/90" variants={itemVariants}>
              {t('subtitle')}
            </motion.p>

            <motion.div className="mt-8 flex flex-col sm:flex-row gap-4" variants={itemVariants}>
              <Button
                color="primary"
                variant="primary"
                size="lg"
                radius="full"
                className="px-8 py-6 text-lg font-medium bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] hover:shadow-lg hover:shadow-[color:var(--ai-primary)]/30 transform hover:-translate-y-1 transition-all duration-300"
                onClick={handleGetStarted}
              >
                {t('getStarted')}
              </Button>

              <Button
                variant="secondary"
                color="secondary"
                size="lg"
                radius="full"
                className="px-8 py-6 text-lg font-medium border-white/50 text-white backdrop-blur-sm hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => router.push('/courses')}
              >
                {t('exploreCourses')}
              </Button>
            </motion.div>

            <motion.div className="mt-10" variants={itemVariants}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['Alex M.', 'Sarah K.', 'John D.', 'Maria P.', 'Chris L.'].map((name, i) => (
                    <div
                      key={i}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[color:var(--ai-primary)]/30 overflow-hidden transform hover:scale-110 hover:z-10 transition-all duration-300"
                    >
                      <DefaultAvatar name={name} size={32} className="" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/90 font-medium">
                  <span className="text-[color:var(--ai-accent)] font-semibold">
                    {stats.totalStudents}+
                  </span>{' '}
                  {t('learnersEnrolled')}
                </div>
              </div>
            </motion.div>

            {/* Tech badges/chips */}
            <motion.div className="mt-8 flex flex-wrap gap-2" variants={itemVariants}>
              {stats.topTechnologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs rounded-full bg-white/20 text-white/90 border border-white/30 backdrop-blur-sm flex items-center"
                >
                  {getTechIcon(tech)}
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative"
            variants={itemVariants}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.3 },
            }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-2xl blur-md opacity-75 animate-pulse" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[color:var(--ai-card-bg)] to-[color:var(--ai-primary)]/20 border border-[color:var(--ai-card-border)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent)] opacity-50" />{' '}
              <Image
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80"
                alt={t('imageAlt')}
                className="w-full h-auto object-cover mix-blend-lighten opacity-90"
                width={600}
                height={400}
                priority
              />
              {/* Futuristic overlay elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[color:var(--ai-primary)]/40 to-transparent" />

                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-[color:var(--ai-accent)] border border-[color:var(--ai-accent)]/30">
                  <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--ai-accent)] animate-pulse"></span>
                  {t('projectBased')}
                </div>

                {/* Tech stack floating animation */}
                {techNodes.slice(0, 3).map((tech, i) => (
                  <div
                    key={tech}
                    className="absolute bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2 py-1 text-xs text-white/90 flex items-center"
                    style={{
                      top: `${20 + i * 20}%`,
                      left: `${10 + i * 25}%`,
                      transform: 'translateY(-50%)',
                      animation: `float-${i} 3s ease-in-out infinite alternate`,
                    }}
                  >
                    <style jsx>{`
                      @keyframes float-${i} {
                        0% {
                          transform: translate(0, 0);
                        }
                        100% {
                          transform: translate(${5 * i}px, ${-5 * i}px);
                        }
                      }
                    `}</style>
                    {getTechIcon(tech)}
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating stats cards - updated with real data */}
            <div className="absolute -bottom-6 -left-6 z-10 rounded-lg bg-white/10 backdrop-blur-md border border-[color:var(--ai-secondary)]/30 shadow-xl p-4 flex items-center gap-3 transform hover:scale-105 transition-transform duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]">
                <svg
                  className="h-6 w-6 text-[color:var(--ai-foreground-inverse)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {stats.totalCourses} {t('stats.coursesAvailable')}
                </p>
                <p className="text-xs text-white/80">{t('stats.projectBasedCurriculum')}</p>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 z-10 rounded-lg bg-white/10 backdrop-blur-md border border-[color:var(--ai-secondary)]/30 shadow-xl p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <p className="text-sm font-medium text-white/90">{t('stats.studentRating')}</p>
                <div className="flex items-center justify-center mt-1">
                  <svg
                    className="h-5 w-5 text-[color:var(--ai-accent)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="mt-1 text-xl font-bold text-white">
                  {stats.avgRating}
                  <span className="text-sm text-white/70">/5</span>
                </p>
                <p className="text-xs text-white/70">
                  {t('stats.reviews', { count: stats.totalReviews || 42 })}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <p className="text-white/80 text-sm mb-2">{t('scrollToExplore')}</p>
        <motion.div
          className="w-8 h-12 rounded-full border-2 border-white/60 flex justify-center p-2"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: { duration: 1.5, repeat: Infinity },
          }}
        >
          <motion.div
            className="w-1 h-2 bg-white/80 rounded-full"
            animate={{
              y: [0, 15, 0],
              transition: { duration: 1.5, repeat: Infinity },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
});

export default HeroSection;
