'use client';

/**
 * TranslationsPanel — shared UI for translating both lessons and courses.
 *
 * Renders a grid of language cards with status badges, individual
 * translate / re-translate / delete actions, and a top toolbar with
 * "translate all missing" / "translate all". When a translation job is
 * active, an animated progress strip per locale is shown using
 * framer-motion (driven by Firestore onSnapshot updates).
 *
 * Used from:
 *   - components/Lesson/LessonForm.tsx  (kind='lesson')
 *   - components/Course/AddCourse.tsx   (kind='course')
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';
import Button from '@/components/ui/Button';
import { CONTENT_LOCALES, ContentLocale, getContentLocale } from '@/config/locales';

type Kind = 'lesson' | 'course';

interface JobLocaleState {
    status: 'queued' | 'processing' | 'complete' | 'failed';
    progress: number;
    message?: string;
    error?: string | null;
}

interface JobSnapshot {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'partial' | 'failed' | 'cancelled';
    progress: number;
    message?: string;
    locales: Record<string, JobLocaleState>;
    cancelRequested?: boolean;
    finishedAt?: number | null;
}

export interface ExistingTranslation {
    status: 'complete' | 'partial' | 'outdated';
    sourceHash: string;
    translatedAt: number;
    captionsTranslated?: boolean;
}

interface Props {
    kind: Kind;
    courseId: string;
    /** Required for lesson kind. */
    lessonId?: string;
    /** Source locale of the original content. */
    sourceLocale: string;
    /** Hash of the current source — used to mark stored translations as outdated. */
    currentSourceHash: string;
    /** Existing translations from Firestore (translations[code]). */
    existingTranslations?: Record<string, ExistingTranslation>;
    /** Active translation job ID currently on the lesson/course doc. */
    activeJobId?: string;
    /** Whether captions can be translated (lesson only — true when source VTT exists). */
    captionsAvailable?: boolean;
}

type LocaleStatus = 'source' | 'missing' | 'outdated' | 'complete' | 'partial' | 'queued' | 'processing' | 'failed';

interface LocaleRow {
    locale: ContentLocale;
    status: LocaleStatus;
    /** Live progress 0-100 if a job is in flight. */
    progress?: number;
    message?: string;
    error?: string | null;
    translatedAt?: number;
    captionsTranslated?: boolean;
}

const STATUS_BADGE: Record<LocaleStatus, { label: string; className: string }> = {
    source: {
        label: 'Source',
        className: 'bg-[color:var(--ai-primary)]/15 text-[color:var(--ai-primary)] border-[color:var(--ai-primary)]/30',
    },
    missing: {
        label: 'Not translated',
        className: 'bg-[color:var(--ai-card-bg)] text-[color:var(--ai-muted)] border-[color:var(--ai-card-border)]',
    },
    outdated: {
        label: 'Outdated',
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    complete: {
        label: 'Up to date',
        className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    },
    partial: {
        label: 'Partial',
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    queued: {
        label: 'Queued',
        className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    processing: {
        label: 'Translating…',
        className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    },
    failed: {
        label: 'Failed',
        className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    },
};

const TranslationsPanel: React.FC<Props> = ({
    kind,
    courseId,
    lessonId,
    sourceLocale,
    currentSourceHash,
    existingTranslations,
    activeJobId,
    captionsAvailable,
}) => {
    const { showToast } = useToast();
    const [job, setJob] = useState<JobSnapshot | null>(null);
    const [trackedJobId, setTrackedJobId] = useState<string | undefined>(activeJobId);
    const [submitting, setSubmitting] = useState<string | null>(null); // locale being submitted, or 'ALL'
    const [includeCaptions, setIncludeCaptions] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Subscribe to the active translation job.
    useEffect(() => {
        const id = trackedJobId;
        if (!id) {
            setJob(null);
            return;
        }
        const ref = doc(firestoreDB, `translationJobs/${id}`);
        const unsub = onSnapshot(ref, (s) => {
            if (!s.exists()) {
                setJob(null);
                return;
            }
            setJob(s.data() as JobSnapshot);
        });
        return () => unsub();
    }, [trackedJobId]);

    useEffect(() => {
        if (activeJobId && activeJobId !== trackedJobId) setTrackedJobId(activeJobId);
    }, [activeJobId, trackedJobId]);

    // Auto-clear job state shortly after completion.
    useEffect(() => {
        if (!job || (job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled' && job.status !== 'partial')) return;
        const t = setTimeout(() => setTrackedJobId(undefined), 8000);
        return () => clearTimeout(t);
    }, [job]);

    // Build locale rows merging stored translations + live job state.
    const rows = useMemo<LocaleRow[]>(() => {
        const sourceCode = sourceLocale;
        return CONTENT_LOCALES.map((locale) => {
            if (locale.code === sourceCode) {
                return { locale, status: 'source' };
            }

            const existing = existingTranslations?.[locale.code];
            const liveState = job?.locales?.[locale.code];

            if (liveState) {
                // Live job overrides stored state for the active locales.
                if (liveState.status === 'queued') {
                    return { locale, status: 'queued', progress: 0, message: liveState.message };
                }
                if (liveState.status === 'processing') {
                    return {
                        locale,
                        status: 'processing',
                        progress: liveState.progress || 5,
                        message: liveState.message,
                    };
                }
                if (liveState.status === 'failed') {
                    return {
                        locale,
                        status: 'failed',
                        message: liveState.message,
                        error: liveState.error,
                    };
                }
                // 'complete' from a live job → fall through to stored handling
                // (the lesson/course doc already has the result).
            }

            if (!existing) {
                return { locale, status: 'missing' };
            }
            const stale = existing.sourceHash !== currentSourceHash;
            const status: LocaleStatus = stale
                ? 'outdated'
                : existing.status === 'complete'
                    ? 'complete'
                    : existing.status === 'partial'
                        ? 'partial'
                        : 'outdated';
            return {
                locale,
                status,
                translatedAt: existing.translatedAt,
                captionsTranslated: existing.captionsTranslated,
            };
        });
    }, [existingTranslations, job, sourceLocale, currentSourceHash]);

    const sourceRow = rows.find((r) => r.status === 'source');
    const otherRows = rows.filter((r) => r.status !== 'source');
    const missingRows = otherRows.filter((r) => r.status === 'missing' || r.status === 'outdated');
    const completeRows = otherRows.filter((r) => r.status === 'complete');

    const isJobActive =
        job && (job.status === 'queued' || job.status === 'processing');

    async function startTranslation(locales: string[], retranslate: boolean) {
        if (locales.length === 0) {
            showToast({ title: 'Nothing to translate', message: 'No locales selected.', type: 'info' });
            return;
        }
        if (!firebaseAuth.currentUser) {
            showToast({ title: 'Not signed in', message: 'Please sign in again.', type: 'error' });
            return;
        }
        setSubmitting(locales.length === 1 ? locales[0] : 'ALL');
        try {
            const idToken = await firebaseAuth.currentUser.getIdToken();
            const endpoint = kind === 'lesson'
                ? '/api/admin/lessons/translate'
                : '/api/admin/courses/translate';
            const body: Record<string, unknown> = {
                courseId,
                targetLocales: locales,
                sourceLocale,
                retranslate,
            };
            if (kind === 'lesson') {
                body.lessonId = lessonId;
                body.includeCaptions = includeCaptions;
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.error || `Translation request failed (${res.status})`);
            }
            if (data.skipped) {
                showToast({ title: 'Already translated', message: data.message, type: 'info' });
                return;
            }
            setTrackedJobId(data.jobId);
            showToast({
                title: 'Translation started',
                message: `${data.locales?.length ?? locales.length} locale(s) queued.`,
                type: 'success',
            });
        } catch (err) {
            showToast({
                title: 'Could not start translation',
                message: err instanceof Error ? err.message : 'Unknown error',
                type: 'error',
            });
        } finally {
            setSubmitting(null);
        }
    }

    async function cancelJob() {
        if (!job?.jobId || !firebaseAuth.currentUser) return;
        try {
            const idToken = await firebaseAuth.currentUser.getIdToken();
            const endpoint = kind === 'lesson'
                ? '/api/admin/lessons/translate/cancel'
                : '/api/admin/courses/translate/cancel';
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ jobId: job.jobId }),
            });
            showToast({ title: 'Cancellation requested', message: 'Stopping after current locale…', type: 'info' });
        } catch (err) {
            showToast({
                title: 'Cancel failed',
                message: err instanceof Error ? err.message : 'Unknown error',
                type: 'error',
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* Header / job summary */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white text-xs font-bold">AI</span>
                        Translations
                    </h3>
                    <p className="text-sm text-[color:var(--ai-muted)] mt-1">
                        Translate {kind === 'lesson' ? 'this lesson' : 'this course'} into {CONTENT_LOCALES.length - 1} languages with Azure OpenAI.
                        {sourceRow ? ` Source: ${sourceRow.locale.flag} ${sourceRow.locale.englishName}.` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {kind === 'lesson' && (
                        <label className="inline-flex items-center gap-2 text-sm text-[color:var(--ai-foreground)] select-none cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeCaptions}
                                onChange={(e) => setIncludeCaptions(e.target.checked)}
                                disabled={!captionsAvailable}
                                className="accent-[color:var(--ai-primary)]"
                                aria-label="Include captions"
                            />
                            <span className={!captionsAvailable ? 'text-[color:var(--ai-muted)] line-through' : ''}>
                                Translate captions (VTT)
                            </span>
                        </label>
                    )}
                    {isJobActive ? (
                        <Button color="danger" variant="flat" size="sm" onPress={cancelJob}>
                            Cancel job
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="flat"
                                color="default"
                                size="sm"
                                isDisabled={missingRows.length === 0 || !!submitting}
                                onPress={() =>
                                    startTranslation(missingRows.map((r) => r.locale.code), false)
                                }
                            >
                                Translate missing ({missingRows.length})
                            </Button>
                            <Button
                                color="primary"
                                size="sm"
                                isDisabled={otherRows.length === 0 || !!submitting}
                                onPress={() =>
                                    startTranslation(otherRows.map((r) => r.locale.code), true)
                                }
                            >
                                {submitting === 'ALL' ? 'Starting…' : `Re-translate all (${otherRows.length})`}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Active job overall progress bar */}
            <AnimatePresence>
                {job && (job.status === 'processing' || job.status === 'queued') && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-[color:var(--ai-card-border)] bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent p-4"
                    >
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-[color:var(--ai-foreground)] inline-flex items-center gap-2">
                                <span className="relative inline-flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--ai-primary)] opacity-60 animate-ping" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--ai-primary)]" />
                                </span>
                                {job.message || 'Translating…'}
                            </span>
                            <span className="text-[color:var(--ai-primary)] font-semibold tabular-nums">
                                {job.progress || 0}%
                            </span>
                        </div>
                        <div className="relative w-full h-2 bg-[color:var(--ai-card-border)] rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${job.progress || 0}%` }}
                                transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                            />
                            <div
                                className="absolute inset-y-0 left-0 right-0 opacity-30 pointer-events-none"
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'cursuri-shimmer 1.4s linear infinite',
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Locale grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rows.map((row) => (
                    <LocaleCard
                        key={row.locale.code}
                        row={row}
                        disabled={!!isJobActive || !!submitting}
                        submittingThis={submitting === row.locale.code}
                        onTranslate={(retranslate) => startTranslation([row.locale.code], retranslate)}
                    />
                ))}
            </div>

            <style jsx global>{`
                @keyframes cursuri-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

interface LocaleCardProps {
    row: LocaleRow;
    disabled: boolean;
    submittingThis: boolean;
    onTranslate: (retranslate: boolean) => void;
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
}

const LocaleCard: React.FC<LocaleCardProps> = ({ row, disabled, submittingThis, onTranslate }) => {
    const { locale, status } = row;
    const badge = STATUS_BADGE[status];
    const isSource = status === 'source';
    const isInProgress = status === 'queued' || status === 'processing';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`relative rounded-xl border p-4 bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm transition-all hover:shadow-md ${isSource
                    ? 'border-[color:var(--ai-primary)]/40'
                    : 'border-[color:var(--ai-card-border)]'
                }`}
            dir={locale.rtl ? 'rtl' : 'ltr'}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{locale.flag}</span>
                        <div className="min-w-0">
                            <p className="font-semibold text-[color:var(--ai-foreground)] truncate">
                                {locale.nativeName}
                            </p>
                            <p className="text-xs text-[color:var(--ai-muted)] truncate">
                                {locale.englishName} · {locale.code}
                            </p>
                        </div>
                    </div>
                </div>
                <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${badge.className}`}
                >
                    {badge.label}
                </span>
            </div>

            {/* Live progress bar when this locale is in progress */}
            <AnimatePresence>
                {isInProgress && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                    >
                        <div className="text-xs text-[color:var(--ai-muted)] mb-1.5 truncate">
                            {row.message || 'Working…'}
                        </div>
                        <div className="relative h-1.5 bg-[color:var(--ai-card-border)] rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${row.progress || (status === 'queued' ? 4 : 30)}%` }}
                                transition={{ type: 'spring', stiffness: 90, damping: 22 }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Translation metadata */}
            {row.translatedAt && status !== 'queued' && status !== 'processing' && (
                <p className="mt-2 text-[11px] text-[color:var(--ai-muted)]">
                    {status === 'outdated' ? 'Translated' : 'Updated'} {timeAgo(row.translatedAt)}
                    {row.captionsTranslated ? ' · CC' : ''}
                </p>
            )}
            {status === 'failed' && row.error && (
                <p className="mt-2 text-[11px] text-red-600 dark:text-red-400 line-clamp-2" title={row.error}>
                    {row.error}
                </p>
            )}

            {/* Actions */}
            {!isSource && !isInProgress && (
                <div className="mt-3 flex items-center justify-end gap-2">
                    {status === 'missing' || status === 'failed' ? (
                        <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            isDisabled={disabled}
                            isLoading={submittingThis}
                            onPress={() => onTranslate(false)}
                        >
                            Translate
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            color="default"
                            variant="flat"
                            isDisabled={disabled}
                            isLoading={submittingThis}
                            onPress={() => onTranslate(true)}
                        >
                            {status === 'outdated' ? 'Update' : 'Re-translate'}
                        </Button>
                    )}
                </div>
            )}

            {/* Animated success checkmark when a locale has just completed via a job */}
            <AnimatePresence>
                {status === 'complete' && row.translatedAt && Date.now() - row.translatedAt < 4000 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md"
                        aria-hidden="true"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TranslationsPanel;
