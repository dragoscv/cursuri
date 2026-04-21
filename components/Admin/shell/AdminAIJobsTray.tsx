'use client';

/**
 * Global "AI Jobs" tray for the admin top bar.
 *
 * - Subscribes to `aiJobs` where status in (queued, processing, ...recent
 *   completed/failed/cancelled) for the signed-in admin.
 * - Badge shows live in-flight count.
 * - Popover lists every job with progress, lesson link and a Cancel button.
 *
 * Because every job lives in Firestore and the worker writes its progress
 * there, the admin can navigate freely between lessons / pages — this
 * component remains the single live view of all running pipelines.
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
} from 'firebase/firestore';
import { Tooltip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseAuth, firestoreDB } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';
import { FiZap as FiCpu, FiCheckCircle, FiAlertCircle, FiExternalLink } from '@/components/icons/FeatherIcons';

const FiX: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

interface AiJob {
    jobId: string;
    courseId: string;
    lessonId: string;
    lessonName?: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    stage?: string;
    progress?: number;
    message?: string;
    error?: string | null;
    createdAt?: number;
    finishedAt?: number;
    cancelRequested?: boolean;
}

const ACTIVE_STATUSES = new Set(['queued', 'processing']);

function statusColor(s: AiJob['status']): string {
    switch (s) {
        case 'queued':
        case 'processing':
            return 'text-amber-500';
        case 'completed':
            return 'text-emerald-500';
        case 'failed':
            return 'text-red-500';
        case 'cancelled':
            return 'text-[color:var(--ai-muted)]';
    }
}

function timeAgo(ts?: number): string {
    if (!ts) return '';
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    return `${Math.floor(sec / 3600)}h ago`;
}

const AdminAIJobsTray: React.FC = () => {
    const ctx = useContext(AppContext);
    const isAdmin = ctx?.isAdmin || false;
    const [jobs, setJobs] = useState<AiJob[]>([]);
    const [open, setOpen] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!isAdmin) return;
        // Last 50 jobs newest first; the UI splits them into active vs recent.
        const q = query(
            collection(firestoreDB, 'aiJobs'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const unsub = onSnapshot(
            q,
            (qs) => {
                const next: AiJob[] = qs.docs.map((d) => ({
                    jobId: d.id,
                    ...(d.data() as Omit<AiJob, 'jobId'>),
                }));
                setJobs(next);
            },
            (err) => {
                console.warn('[ai-jobs-tray] snapshot error', err);
            }
        );
        return () => unsub();
    }, [isAdmin]);

    // Click-outside to close popover.
    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const t = e.target as Node;
            if (popoverRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    const active = useMemo(() => jobs.filter((j) => ACTIVE_STATUSES.has(j.status)), [jobs]);
    const recent = useMemo(
        () => jobs.filter((j) => !ACTIVE_STATUSES.has(j.status)).slice(0, 8),
        [jobs]
    );
    const activeCount = active.length;

    const handleCancel = async (jobId: string) => {
        if (cancellingId) return;
        setCancellingId(jobId);
        try {
            const token = await firebaseAuth.currentUser?.getIdToken();
            if (!token) return;
            await fetch('/api/admin/lessons/ai-process/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ jobId }),
            });
        } catch (err) {
            console.warn('[ai-jobs-tray] cancel failed', err);
        } finally {
            setCancellingId(null);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="relative">
            <Tooltip content={activeCount > 0 ? `${activeCount} AI job(s) running` : 'AI jobs'} placement="bottom">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="relative h-9 w-9 grid place-items-center rounded-lg text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition"
                    aria-label="AI jobs"
                >
                    <FiCpu size={18} />
                    {activeCount > 0 && (
                        <motion.span
                            key={activeCount}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[color:var(--ai-primary)] text-white text-[10px] font-bold grid place-items-center"
                        >
                            {activeCount}
                        </motion.span>
                    )}
                </button>
            </Tooltip>

            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-2 w-[360px] max-h-[70vh] overflow-auto rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] shadow-2xl z-50"
                    >
                        <div className="px-4 py-3 border-b border-[color:var(--ai-card-border)] flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-[color:var(--ai-foreground)] inline-flex items-center gap-2">
                                    <FiCpu size={14} className="text-[color:var(--ai-primary)]" />
                                    AI processing jobs
                                </div>
                                <div className="text-[11px] text-[color:var(--ai-muted)] mt-0.5">
                                    {activeCount === 0
                                        ? 'No jobs running.'
                                        : `${activeCount} running · saved on the server`}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]"
                                aria-label="Close"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        {active.length === 0 && recent.length === 0 && (
                            <div className="px-4 py-6 text-sm text-[color:var(--ai-muted)] text-center">
                                You haven't queued any AI jobs yet.
                            </div>
                        )}

                        {active.length > 0 && (
                            <div className="divide-y divide-[color:var(--ai-card-border)]/60">
                                {active.map((j) => (
                                    <JobRow
                                        key={j.jobId}
                                        job={j}
                                        cancelling={cancellingId === j.jobId}
                                        onCancel={() => handleCancel(j.jobId)}
                                    />
                                ))}
                            </div>
                        )}

                        {recent.length > 0 && (
                            <div className="border-t border-[color:var(--ai-card-border)] bg-black/5 dark:bg-white/[0.02]">
                                <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-[color:var(--ai-muted)] font-semibold">
                                    Recent
                                </div>
                                <div className="divide-y divide-[color:var(--ai-card-border)]/60">
                                    {recent.map((j) => (
                                        <JobRow key={j.jobId} job={j} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface JobRowProps {
    job: AiJob;
    cancelling?: boolean;
    onCancel?: () => void;
}

const JobRow: React.FC<JobRowProps> = ({ job, cancelling, onCancel }) => {
    const isActive = ACTIVE_STATUSES.has(job.status);
    const progress = Math.max(0, Math.min(100, job.progress ?? 0));
    const lessonHref = `/admin/courses/${job.courseId}/lessons/${job.lessonId}/edit`;
    return (
        <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--ai-foreground)] truncate">
                        {job.status === 'completed' ? (
                            <FiCheckCircle size={14} className={statusColor(job.status)} />
                        ) : job.status === 'failed' || job.status === 'cancelled' ? (
                            <FiAlertCircle size={14} className={statusColor(job.status)} />
                        ) : (
                            <span className="inline-block h-3 w-3 rounded-full border-2 border-[color:var(--ai-primary)] border-t-transparent animate-spin" />
                        )}
                        <span className="truncate" title={job.lessonName}>
                            {job.lessonName || job.lessonId}
                        </span>
                    </div>
                    <div className="text-[11px] text-[color:var(--ai-muted)] truncate" title={job.message}>
                        {job.message || job.stage || job.status}
                    </div>
                </div>
                <Link
                    href={lessonHref}
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] flex-none"
                    title="Open lesson"
                >
                    <FiExternalLink size={14} />
                </Link>
            </div>

            {isActive && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-[color:var(--ai-card-border)] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[color:var(--ai-muted)]">
                    {isActive ? `${progress}%` : ''}
                    {!isActive && job.finishedAt ? `Finished ${timeAgo(job.finishedAt)}` : null}
                    {isActive && job.createdAt ? ` · started ${timeAgo(job.createdAt)}` : null}
                </span>
                {isActive && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={cancelling || job.cancelRequested}
                        className="text-[11px] font-medium text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelling || job.cancelRequested ? 'Cancelling…' : 'Cancel'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminAIJobsTray;
