'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiZap, FiCode, FiDownload } from '@/components/icons/FeatherIcons';

/**
 * Canonical link to the OpenCode setup & configuration lesson.
 * Always rendered as a relative `next/link` so client-side navigation works.
 */
export const OPENCODE_LESSON_HREF =
    '/courses/Oe5UjqP4LiRFgxCFX5W9/lessons/actKradNHY4AbhiCobPk';

export const VSCODE_INSIDERS_HREF = 'https://code.visualstudio.com/insiders/';

type Variant = 'hero' | 'banner' | 'success' | 'setup';

interface Props {
    variant?: Variant;
    /** Override CTA href on banner variant (e.g. point to /subscriptions). */
    ctaHref?: string;
    className?: string;
}

function GitHubMark({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

const CopilotPerksCard: React.FC<Props> = ({
    variant = 'hero',
    ctaHref,
    className = '',
}) => {
    const t = useTranslations('subscription.copilot');

    const perks = [
        {
            icon: <GitHubMark className="w-5 h-5" />,
            title: t('perks.account.title'),
            description: t('perks.account.description'),
        },
        {
            icon: <FiCode size={18} />,
            title: t('perks.vscode.title'),
            description: t('perks.vscode.description'),
        },
        {
            icon: <FiZap size={18} />,
            title: t('perks.opencode.title'),
            description: t('perks.opencode.description'),
        },
    ];

    if (variant === 'banner') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] dark:from-[#0d1117] dark:via-[#161b22] dark:to-[#0d1117] text-white p-6 md:p-8 shadow-xl ${className}`}
            >
                <div
                    aria-hidden
                    className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-transparent blur-3xl"
                />
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <GitHubMark className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300 font-semibold">
                                {t('eyebrow')}
                            </span>
                            <span className="text-lg md:text-xl font-bold leading-tight">
                                {t('headline')}
                            </span>
                        </div>
                    </div>
                    <ul className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        {perks.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-white/90">
                                <span className="mt-0.5 flex-shrink-0 text-violet-300">{p.icon}</span>
                                <span className="leading-snug">{p.title}</span>
                            </li>
                        ))}
                    </ul>
                    {ctaHref && (
                        <Link
                            href={ctaHref}
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-white text-[#0d1117] text-sm font-semibold hover:bg-white/90 transition-colors"
                        >
                            {t('cta.viewPlans')}
                            <FiArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </motion.div>
        );
    }

    if (variant === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 md:p-8 ${className}`}
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <FiCheck size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
                            {t('success.title')}
                        </h3>
                        <p className="text-[color:var(--ai-muted)] mb-4">
                            {t('success.description')}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/profile/github"
                                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-[color:var(--ai-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                <GitHubMark className="w-4 h-4" />
                                {t('success.viewAccount')}
                            </Link>
                            <Link
                                href={OPENCODE_LESSON_HREF}
                                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-[color:var(--ai-card-border)] text-sm font-semibold text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/60 transition-colors"
                            >
                                <FiCode size={14} />
                                {t('success.setupGuide')}
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (variant === 'setup') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm p-6 md:p-8 ${className}`}
            >
                <div className="flex items-start gap-4 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center">
                        <FiZap size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-[color:var(--ai-foreground)]">
                            {t('setup.title')}
                        </h3>
                        <p className="text-sm text-[color:var(--ai-muted)] mt-1">
                            {t('setup.description')}
                        </p>
                    </div>
                </div>
                <ol className="space-y-3 mb-5">
                    {[1, 2, 3].map((step) => (
                        <li key={step} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[color:var(--ai-primary)]/15 text-[color:var(--ai-primary)] text-xs font-bold flex items-center justify-center">
                                {step}
                            </span>
                            <span className="text-sm text-[color:var(--ai-foreground)]">
                                {t(`setup.step${step}`)}
                            </span>
                        </li>
                    ))}
                </ol>
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[color:var(--ai-card-border)]">
                    <Link
                        href={OPENCODE_LESSON_HREF}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-[color:var(--ai-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        <FiCode size={14} />
                        {t('setup.openLesson')}
                    </Link>
                    <a
                        href={VSCODE_INSIDERS_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-[color:var(--ai-card-border)] text-sm font-semibold text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/60 transition-colors"
                    >
                        <FiDownload size={14} />
                        {t('setup.downloadInsiders')}
                    </a>
                </div>
            </motion.div>
        );
    }

    // Default: hero
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative overflow-hidden rounded-3xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#1f2937] text-white shadow-2xl ${className}`}
        >
            {/* Decorative gradients */}
            <div
                aria-hidden
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/30 via-indigo-500/20 to-transparent blur-3xl"
            />
            <div
                aria-hidden
                className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/10 to-transparent blur-3xl"
            />

            <div className="relative p-6 md:p-10 lg:p-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <GitHubMark className="w-9 h-9 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-300 font-semibold mb-1">
                                {t('eyebrow')}
                            </p>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                                {t('headline')}
                            </h2>
                        </div>
                    </div>
                </div>

                <p className="text-base md:text-lg text-white/80 max-w-2xl mb-8 leading-relaxed">
                    {t('lead')}
                </p>

                {/* Perks grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {perks.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center mb-3">
                                {p.icon}
                            </div>
                            <h3 className="font-semibold text-white mb-1.5">{p.title}</h3>
                            <p className="text-sm text-white/70 leading-relaxed">{p.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer CTA row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-6 border-t border-white/10">
                    <p className="text-sm text-white/70 flex-1">{t('footnote')}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={OPENCODE_LESSON_HREF}
                            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
                        >
                            <FiCode size={14} />
                            {t('cta.openLesson')}
                        </Link>
                        <a
                            href={VSCODE_INSIDERS_HREF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-white text-[#0d1117] text-sm font-semibold hover:bg-white/90 transition-colors"
                        >
                            <FiDownload size={14} />
                            {t('cta.downloadInsiders')}
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CopilotPerksCard;
