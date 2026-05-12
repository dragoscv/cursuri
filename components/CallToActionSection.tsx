'use client';

/**
 * CallToActionSection v2 — editorial closing card.
 *
 * SCENE: a single, generously padded bordered card sitting on the editorial
 * surface — like a closing pull-quote in a magazine. Subtle gradient wash
 * inside the card (not full-bleed) keeps the page calm. No floating orbs,
 * no animated particles, no noise.
 */

import React, { memo, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AppContext } from './AppContext';
import Login from './Login';
import { Reveal, Stagger, fadeUp } from '@/components/motion';
import { motion } from 'framer-motion';

const CallToActionSection = memo(function CallToActionSection() {
  const t = useTranslations('home.cta');
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }

  const { openModal, closeModal, user } = context;

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
        modalHeader: t('button'),
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
    <section className="relative w-full py-20 md:py-28">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal trigger="view" offset={36}>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-[var(--shadow-cinematic)]">
            {/* Inset gradient wash */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-amber-400/12 via-transparent to-amber-400/8 pointer-events-none"
            />
            {/* Top gold rim */}
            <div aria-hidden className="absolute top-0 inset-x-0 cinematic-rim-divider" />

            <div className="relative px-8 py-14 md:px-14 md:py-20 text-center">
              <Stagger gap={0.08} delay={0.05}>
                <motion.p
                  variants={fadeUp}
                  className="text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-500 mb-5"
                >
                  {t('eyebrow')}
                </motion.p>

                <motion.h2
                  variants={fadeUp}
                  className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold tracking-[-0.02em] leading-[1.05] text-[color:var(--ai-foreground)] max-w-3xl mx-auto"
                >
                  {t('title')}
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  className="mt-5 text-lg text-[color:var(--ai-muted)] leading-relaxed max-w-2xl mx-auto"
                >
                  {t('subtitle')}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-10 flex flex-col sm:flex-row justify-center gap-3.5"
                >
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-[15px] font-semibold bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {t('button')}
                    <span aria-hidden>→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/book-a-call')}
                    className="cursor-pointer inline-flex items-center justify-center h-12 px-8 rounded-full text-[15px] font-semibold border border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-foreground)]/40 hover:bg-[color:var(--ai-card-bg)]/60 transition-colors duration-200"
                  >
                    {t('secondaryButton')}
                  </button>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  variants={fadeUp}
                  className="mt-12 pt-8 border-t border-[color:var(--ai-card-border)] flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-[13px] text-[color:var(--ai-muted)]"
                >
                  <TrustBadge label={t('benefits.moneyBack')} />
                  <span className="opacity-30 hidden sm:inline">·</span>
                  <TrustBadge label={t('benefits.lifetimeAccess')} />
                  <span className="opacity-30 hidden sm:inline">·</span>
                  <TrustBadge label={t('benefits.certificate')} />
                </motion.div>
              </Stagger>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
});

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className="w-4 h-4 text-emerald-500/80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {label}
    </span>
  );
}

export default CallToActionSection;
