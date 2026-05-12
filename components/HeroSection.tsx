'use client';

/**
 * HeroSection v2 — Editorial / premium split layout (v0.6).
 *
 * SCENE: a calm editorial spread (Stripe / Vercel / Linear marketing feel).
 *   - LEFT  : oversized typographic statement + 2 CTAs + social proof
 *   - RIGHT : a fake editor window typing live AI-prompt / code / workflow
 *
 * Background is intentionally STATIC — a soft radial wash + ultra-faint
 * static grid masked to fade at edges. No starfield, no orbs, no particles.
 *
 * Motion is reserved for: type entrance (one stagger), CodeTyper, the gold
 * accent underline drawing in. Everything pauses under reduced motion.
 */

import React, { useContext, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AppContext } from '@/components/AppContext';
import Login from './Login';
import { CopilotIcon } from './icons/tech';
import { DiscordIcon } from './icons/DiscordIcon';
import DefaultAvatar from './shared/DefaultAvatar';
import { Reveal, Stagger, fadeUp } from '@/components/motion';

// CodeTyper carries its own DOM weight — only load when hero scrolls into view
const CodeTyper = dynamic(
  () => import('./Home/CodeTyper').then((mod) => ({ default: mod.CodeTyper })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[360px] rounded-xl border border-white/10 bg-[#0a0e17]/60 animate-pulse" />
    ),
  }
);

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
    <section className="relative w-full editorial-surface overflow-hidden">
      {/* Static editorial grid — masked, no animation */}
      <div aria-hidden className="absolute inset-0 editorial-grid pointer-events-none" />

      {/* Top thin rule (gold) — premium magazine feel */}
      <div aria-hidden className="absolute top-0 inset-x-0 cinematic-rim-divider" />

      <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* === LEFT: editorial copy (7/12) === */}
          <Stagger className="lg:col-span-7" gap={0.08} delay={0.1}>
            {/* Eyebrow chip */}
            <motion.div variants={fadeUp}>
              <Link
                href="/subscriptions"
                className="group inline-flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-full text-[12px] font-medium bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)] hover:border-amber-500/60 transition-colors duration-200"
              >
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-amber-500 text-[color:var(--ai-background)]">
                  {t('copilotBadge.eyebrow')}
                </span>
                <CopilotIcon size={14} />
                <span className="opacity-90">{t('copilotBadge.label')}</span>
                <span className="text-amber-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            </motion.div>

            {/* Display headline */}
            <motion.h1
              variants={fadeUp}
              className="mt-8 text-[clamp(2.75rem,6.4vw,5.5rem)] font-semibold tracking-[-0.025em] text-[color:var(--ai-foreground)] leading-[1.02]"
            >
              <span className="block">{t('title.line1')}</span>
              <span className="block mt-2 relative">
                <span className="text-[color:var(--ai-foreground)]">{t('title.line2')}</span>
                {/* Hand-drawn-style underline accent */}
                {!prefersReduced && (
                  <motion.svg
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    viewBox="0 0 600 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1 left-0 w-full h-2.5 text-amber-400/70"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.9, duration: 0.9, ease: 'easeOut' }}
                      d="M2 8 Q 150 2 300 6 T 598 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                )}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-7 text-lg md:text-xl text-[color:var(--ai-muted)] leading-relaxed max-w-2xl"
            >
              {t('subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-3.5">
              <button
                type="button"
                onClick={handleGetStarted}
                className="cursor-pointer inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-[15px] font-semibold bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('getStarted')}
                <span aria-hidden>→</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/courses')}
                className="cursor-pointer inline-flex items-center justify-center h-12 px-7 rounded-full text-[15px] font-semibold border border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-foreground)]/40 hover:bg-[color:var(--ai-card-bg)]/40 transition-colors duration-200"
              >
                {t('exploreCourses')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/discord')}
                className="cursor-pointer inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full text-[15px] font-semibold text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] transition-colors duration-200"
              >
                <DiscordIcon size={18} />
                {t('joinDiscord')}
              </button>
            </motion.div>

            {/* Mentor 1-on-1 link */}
            <motion.div variants={fadeUp} className="mt-5">
              <Link
                href="/book-a-call"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--ai-muted)] hover:text-amber-500 transition-colors group"
              >
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t('bookACall')}
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </motion.div>

            {/* Social proof + rating row */}
            <motion.div
              variants={fadeUp}
              className="mt-12 pt-7 border-t border-[color:var(--ai-card-border)] flex flex-wrap items-center gap-x-8 gap-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {['Alex M.', 'Sarah K.', 'John D.', 'Maria P.', 'Chris L.'].map((name) => (
                    <div
                      key={name}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[color:var(--ai-background)] overflow-hidden"
                    >
                      <DefaultAvatar name={name} size={32} className="" />
                    </div>
                  ))}
                </div>
                <div className="text-[13px] text-[color:var(--ai-muted)]">
                  <span className="font-semibold text-[color:var(--ai-foreground)]">
                    {stats.totalStudents}+
                  </span>{' '}
                  {t('learnersEnrolled')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg
                      key={i}
                      className="h-3.5 w-3.5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[13px] font-semibold text-[color:var(--ai-foreground)]">
                  {stats.avgRating}/5
                </span>
                <span className="text-[13px] text-[color:var(--ai-muted)]">
                  {t('stats.reviews', { count: stats.totalReviews || 42 })}
                </span>
              </div>

              <div className="text-[13px] text-[color:var(--ai-muted)]">
                <span className="font-semibold text-[color:var(--ai-foreground)]">
                  {stats.totalCourses}
                </span>{' '}
                {t('stats.coursesAvailable')}
              </div>
            </motion.div>
          </Stagger>

          {/* === RIGHT: live code typer (5/12) === */}
          <Reveal delay={0.35} offset={28} className="lg:col-span-5">
            <div className="relative">
              {/* Soft gold glow under the editor */}
              <div
                aria-hidden
                className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[color:var(--ai-primary)]/12 via-transparent to-amber-400/12 blur-2xl"
              />
              <div className="relative">
                <CodeTyper />
              </div>

              {/* Copilot ribbon — compact under the editor */}
              <Link
                href="/subscriptions"
                className="group mt-5 block relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm p-4 hover:border-[color:var(--ai-primary)]/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[color:var(--ai-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <CopilotIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[color:var(--ai-foreground)] leading-tight truncate">
                      {t('copilotRibbon.title')}
                    </p>
                    <p className="text-[11px] text-[color:var(--ai-muted)] mt-0.5 truncate">
                      {(t.raw('copilotRibbon.models') as string[]).slice(0, 3).join(' · ')}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-[color:var(--ai-primary)] group-hover:translate-x-0.5 transition-transform shrink-0"
                  >
                    →
                  </span>
                </div>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;
