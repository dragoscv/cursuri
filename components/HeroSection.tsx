'use client';

/**
 * HeroSection — Cinematic AI-lab redesign (v0.5).
 *
 * SCENE: viewer is inside a dark observation chamber. A drifting starfield
 * envelops the camera; two specimen orbs (indigo + amber) hover at calibrated
 * thirds, casting rim light across the display type. Right-side console
 * shows live "specimens" — AI tools floating in glass capsules.
 *
 * Motion arc (3 acts):
 *   Act I  (0-400ms):   atmosphere fades in
 *   Act II (300-900ms): copy lands, orbs settle
 *   Act III (700ms+):   CTAs + console capsules stagger in
 *
 * All decorative R3F is lazy-loaded (ssr:false). prefers-reduced-motion
 * users get a static CSS starfield + no entrance animation.
 */

import React, { useContext, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Button from '@/components/ui/Button';
import { AppContext } from '@/components/AppContext';
import Login from './Login';
import {
  ChatGPTIcon,
  MidjourneyIcon,
  ClaudeIcon,
  GeminiIcon,
  CopilotIcon,
  StableDiffusionIcon,
} from './icons/tech';
import { DiscordIcon } from './icons/DiscordIcon';
import DefaultAvatar from './shared/DefaultAvatar';
import { Reveal, Stagger, fadeUp, cosmic } from '@/components/motion';

// Lazy R3F — never ships in the initial bundle, never SSRs
const HeroAtmosphere = dynamic(() => import('./Home/HeroAtmosphere'), {
  ssr: false,
  loading: () => null,
});

type TechNode = {
  name: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  tone: 'cool' | 'warm';
};

const TECH_NODES: TechNode[] = [
  { name: 'ChatGPT', Icon: ChatGPTIcon, tone: 'warm' },
  { name: 'Claude', Icon: ClaudeIcon, tone: 'warm' },
  { name: 'Copilot', Icon: CopilotIcon, tone: 'cool' },
  { name: 'Midjourney', Icon: MidjourneyIcon, tone: 'cool' },
  { name: 'Gemini', Icon: GeminiIcon, tone: 'warm' },
  { name: 'Stable Diffusion', Icon: StableDiffusionIcon, tone: 'cool' },
];

const HeroSection = memo(function HeroSection() {
  const t = useTranslations('home.hero');
  const router = useRouter();
  const context = useContext(AppContext);
  const prefersReduced = useReducedMotion();

  const courses = useMemo(() => context?.courses || {}, [context?.courses]);
  const reviews = useMemo(() => context?.reviews || {}, [context?.reviews]);
  const userPaidProducts = useMemo(
    () => context?.userPaidProducts || [],
    [context?.userPaidProducts]
  );

  const stats = useMemo(() => {
    const totalCourses = Object.keys(courses).length;
    const uniqueStudents = new Set(userPaidProducts.map((p) => p.metadata?.userId || ''));
    const totalStudents = uniqueStudents.size > 0 ? uniqueStudents.size : userPaidProducts.length;

    let reviewCount = 0;
    let ratingSum = 0;
    Object.keys(reviews).forEach((cid) => {
      const cr = reviews[cid];
      if (!cr) return;
      Object.keys(cr).forEach((rid) => {
        reviewCount++;
        const r = cr[rid];
        if (r && typeof r === 'object' && 'rating' in r && r.rating) {
          ratingSum += r.rating;
        }
      });
    });

    return {
      totalCourses,
      totalStudents: totalStudents || Math.max(50, totalCourses * 10),
      totalReviews: reviewCount,
      avgRating: reviewCount > 0 ? +(ratingSum / reviewCount).toFixed(1) : 4.8,
    };
  }, [courses, userPaidProducts, reviews]);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-[color:var(--ai-muted)]">
        {t('loading')}
      </div>
    );
  }

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
      document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[92vh] flex items-center overflow-hidden cinematic-atmosphere">
      {/* === BACKGROUND LAYER: atmosphere === */}
      {/* Static CSS starfield always present (covers SSR + reduced-motion) */}
      <div
        aria-hidden
        className="absolute inset-0 cinematic-starfield-static opacity-70 dark:opacity-90"
      />
      {/* Lazy R3F drifting starfield + glowing orbs */}
      {!prefersReduced && <HeroAtmosphere />}

      {/* Vignette to anchor type */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--ai-background)]/40 pointer-events-none"
      />

      {/* === FOREGROUND LAYER: content === */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Copy column — left 7/12 (rule of thirds anchor) */}
          <Stagger className="lg:col-span-7" gap={0.09} delay={0.12}>
            {/* Eyebrow badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <Link
                href="/subscriptions"
                className="group inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full text-sm font-medium bg-white/40 dark:bg-white/[0.04] backdrop-blur-md text-[color:var(--ai-foreground)] border border-white/30 dark:border-white/10 hover:border-[color:var(--ai-primary)]/50 transition-all"
              >
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[color:var(--ai-primary)] text-white">
                  {t('copilotBadge.eyebrow')}
                </span>
                <CopilotIcon size={16} />
                <span>{t('copilotBadge.label')}</span>
                <span className="text-[color:var(--ai-primary)] font-semibold group-hover:translate-x-0.5 transition-transform">
                  {t('copilotBadge.cta')} →
                </span>
              </Link>
            </motion.div>

            {/* Display type */}
            <motion.h1
              variants={fadeUp}
              className="text-[clamp(2.5rem,6vw,5.25rem)] font-bold tracking-tight text-[color:var(--ai-foreground)] leading-[1.02]"
            >
              <span className="block">{t('title.line1')}</span>
              <span
                className="block mt-2 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(110deg, var(--ai-primary) 0%, var(--ai-secondary) 45%, #fbbf24 100%)',
                  filter: 'drop-shadow(0 0 18px rgba(var(--ai-primary-rgb), 0.25))',
                }}
              >
                {t('title.line2')}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 text-lg md:text-xl text-[color:var(--ai-muted)] leading-relaxed max-w-2xl"
            >
              {t('subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-9 flex flex-col sm:flex-row gap-4">
              <Button
                color="primary"
                variant="primary"
                size="lg"
                radius="full"
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-[var(--shadow-glow-primary)] hover:shadow-[var(--shadow-glow-rim)] hover:-translate-y-0.5 transition-all duration-300"
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
                className="px-8 py-6 text-base font-semibold border border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/[0.03] backdrop-blur-md text-[color:var(--ai-foreground)] hover:bg-white/50 dark:hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => router.push('/courses')}
              >
                {t('exploreCourses')}
              </Button>
              <button
                type="button"
                onClick={handleGetStarted}
                className="hidden"
                aria-hidden
                tabIndex={-1}
              />
            </motion.div>

            {/* 1-on-1 mentor link */}
            <motion.div variants={fadeUp} className="mt-5">
              <Link
                href="/book-a-call"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors group"
              >
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full bg-[color:var(--ai-primary)] orb-breath"
                />
                {t('bookACall')}
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </motion.div>

            {/* Social proof + rating row */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['Alex M.', 'Sarah K.', 'John D.', 'Maria P.', 'Chris L.'].map((name) => (
                    <div
                      key={name}
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
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-[color:var(--ai-foreground)]">
                  {stats.avgRating}/5
                </span>
                <span className="text-sm text-[color:var(--ai-muted)]">
                  {t('stats.reviews', { count: stats.totalReviews || 42 })}
                </span>
              </div>
            </motion.div>
          </Stagger>

          {/* Visual console — right 5/12. Hidden on mobile to save weight. */}
          <Reveal delay={0.55} offset={32} className="lg:col-span-5 hidden lg:block">
            <ConsolePanel courses={stats.totalCourses} />
          </Reveal>
        </div>

        {/* Mobile Copilot ribbon */}
        <div className="lg:hidden mt-10">
          <CopilotRibbon t={t} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <p className="text-[color:var(--ai-muted)] text-xs mb-2 tracking-widest uppercase">
          {t('scrollToExplore')}
        </p>
        <motion.div
          className="w-6 h-10 rounded-full border border-[color:var(--ai-primary)]/40 flex justify-center p-1.5"
          animate={prefersReduced ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1 h-2 bg-[color:var(--ai-primary)] rounded-full"
            animate={prefersReduced ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
});

/* -------- Console panel: glass card with floating tech specimens -------- */

function ConsolePanel({ courses }: { courses: number }) {
  const t = useTranslations('home.hero');
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[color:var(--ai-primary)]/25 via-transparent to-amber-400/15 blur-3xl"
      />

      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/[0.04] dark:via-white/[0.02] backdrop-blur-xl p-7 shadow-[var(--shadow-cinematic)]">
        {/* Console header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--ai-primary)] orb-breath" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[color:var(--ai-muted)]">
              {t('console.title')}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[color:var(--ai-muted)]">
            {courses.toString().padStart(2, '0')} {t('console.specimens')}
          </span>
        </div>

        {/* Specimens grid */}
        <div className="grid grid-cols-2 gap-3">
          {TECH_NODES.map((node, i) => (
            <motion.div
              key={node.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: cosmic, delay: 0.7 + i * 0.07 }}
              className="group relative rounded-xl border border-white/10 bg-white/5 dark:bg-white/[0.03] p-3 hover:bg-white/10 dark:hover:bg-white/[0.06] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    node.tone === 'warm'
                      ? 'bg-amber-400/15 text-amber-200'
                      : 'bg-[color:var(--ai-primary)]/15 text-[color:var(--ai-primary)]'
                  }`}
                >
                  <node.Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[color:var(--ai-foreground)] truncate">
                    {node.name}
                  </p>
                  <p className="text-[10px] text-[color:var(--ai-muted)] uppercase tracking-wider">
                    {t('console.tools')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Embedded copilot ribbon */}
        <CopilotRibbon t={t} compact />
      </div>
    </div>
  );
}

/* -------- Copilot ribbon (shared mobile + console) -------- */

function CopilotRibbon({
  t,
  compact = false,
}: {
  t: ReturnType<typeof useTranslations>;
  compact?: boolean;
}) {
  return (
    <Link
      href="/subscriptions"
      className={`group block relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#1f2937] ${
        compact ? 'mt-6 p-4' : 'p-5'
      } hover:border-[color:var(--ai-primary)]/50 transition-all`}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-transparent blur-3xl"
      />
      <div className="relative flex flex-col gap-3 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <CopilotIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white leading-tight">{t('copilotRibbon.title')}</p>
            <p className="text-xs text-white/70 mt-0.5 break-words">
              {t('copilotRibbon.description')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {(t.raw('copilotRibbon.models') as string[]).map((model) => (
            <span
              key={model}
              className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/10 text-white/90 border border-white/10 whitespace-nowrap max-w-full"
            >
              {model}
            </span>
          ))}
        </div>
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white text-[#0d1117] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
            {t('copilotRibbon.cta')} →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default HeroSection;
