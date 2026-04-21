'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';
import Button from '@/components/ui/Button';
import Select, { SelectItem } from '@/components/ui/Select';
import {
    FiPlay,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
} from '@/components/icons/FeatherIcons';
import LessonAIProgressModal, {
    type AiProgressState,
    type AiStage,
} from './LessonAIProgressModal';

interface LessonAIProcessorProps {
    courseId: string;
    /** If absent, the form is in "create" mode and we hide the action. */
    lessonId?: string;
    videoUrl?: string;
    /** Called when the admin confirms they want to push values into the form. */
    onApply?: (data: { transcription?: string }) => void;
}

interface LessonAiSnapshot {
    audioUrl?: string;
    audioFileName?: string;
    audioDurationSeconds?: number | null;
    transcription?: string;
    transcriptionLanguage?: string;
    summary?: string;
    keyPoints?: string[];
    aiContentGeneratedAt?: number;
    aiProcessingStatus?: 'idle' | 'processing' | 'completed' | 'failed' | 'cancelled';
    captions?: Record<string, { url?: string }>;
    currentAiJobId?: string;
}

interface AiJobSnapshot {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    stage?: AiStage;
    progress?: number;
    message?: string;
    error?: string | null;
    audioUrl?: string;
    transcript?: string;
    transcriptionLanguage?: string;
    summary?: string;
    keyPoints?: string[];
    audioDurationSeconds?: number | null;
}

const LANGUAGES = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'ro-RO', label: 'Romanian (RO)' },
    { code: 'es-ES', label: 'Spanish (ES)' },
    { code: 'fr-FR', label: 'French (FR)' },
    { code: 'de-DE', label: 'German (DE)' },
    { code: 'it-IT', label: 'Italian (IT)' },
];

function formatDuration(s?: number | null): string {
    if (!s || s <= 0) return '—';
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

const LessonAIProcessor: React.FC<LessonAIProcessorProps> = ({
    courseId,
    lessonId,
    videoUrl,
    onApply,
}) => {
    const { showToast } = useToast();
    const [language, setLanguage] = useState('en-US');
    const [submitting, setSubmitting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [snap, setSnap] = useState<LessonAiSnapshot>({});
    const [job, setJob] = useState<AiJobSnapshot | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const previousJobStatusRef = useRef<string | undefined>(undefined);
    const modalOpenRef = useRef(false);

    useEffect(() => {
        modalOpenRef.current = modalOpen;
    }, [modalOpen]);

    // Subscribe to the lesson document — we mostly need `currentAiJobId` and
    // the persisted result fields (transcription, summary, audioUrl) used to
    // render the "previously generated" state.
    useEffect(() => {
        if (!courseId || !lessonId) return;
        const ref = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
        const unsub = onSnapshot(ref, (s) => {
            if (!s.exists()) return;
            const d = s.data() as LessonAiSnapshot;
            setSnap({
                audioUrl: d.audioUrl,
                audioFileName: d.audioFileName,
                audioDurationSeconds: d.audioDurationSeconds,
                transcription: d.transcription,
                transcriptionLanguage: d.transcriptionLanguage,
                summary: d.summary,
                keyPoints: d.keyPoints,
                aiContentGeneratedAt: d.aiContentGeneratedAt,
                aiProcessingStatus: d.aiProcessingStatus,
                captions: d.captions,
                currentAiJobId: d.currentAiJobId,
            });
            if (d.transcriptionLanguage) setLanguage(d.transcriptionLanguage);
        });
        return () => unsub();
    }, [courseId, lessonId]);

    // Subscribe to the active job (if any) OR to the most recent terminal
    // job for this lesson so we can show its result/error without storing
    // the jobId in the lesson doc forever.
    useEffect(() => {
        if (!lessonId) return;
        // If the lesson points at a specific in-flight job, track that doc
        // directly. Otherwise fall back to the most recent job for the
        // lesson so post-completion state stays available.
        if (snap.currentAiJobId) {
            const jobRef = doc(firestoreDB, `aiJobs/${snap.currentAiJobId}`);
            const unsub = onSnapshot(jobRef, (s) => {
                if (!s.exists()) {
                    setJob(null);
                    return;
                }
                setJob({ jobId: s.id, ...(s.data() as Omit<AiJobSnapshot, 'jobId'>) });
            });
            return () => unsub();
        }

        const q = query(
            collection(firestoreDB, 'aiJobs'),
            where('lessonId', '==', lessonId),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const unsub = onSnapshot(q, (qs) => {
            const docSnap = qs.docs[0];
            if (!docSnap) {
                setJob(null);
                return;
            }
            setJob({ jobId: docSnap.id, ...(docSnap.data() as Omit<AiJobSnapshot, 'jobId'>) });
        });
        return () => unsub();
    }, [lessonId, snap.currentAiJobId]);

    // Auto-open the modal if a job is running when we mount/refresh.
    useEffect(() => {
        if (!job) return;
        if (
            (job.status === 'queued' || job.status === 'processing') &&
            !modalOpenRef.current
        ) {
            setModalOpen(true);
        }
        // Toast on transition to terminal state when the modal is closed.
        const prev = previousJobStatusRef.current;
        if (prev && prev !== job.status && !modalOpenRef.current) {
            if (job.status === 'completed') {
                showToast({
                    type: 'success',
                    title: 'AI assets generated',
                    message: 'Audio, captions and summary saved on the lesson.',
                    duration: 5000,
                });
            } else if (job.status === 'failed') {
                showToast({
                    type: 'error',
                    title: 'AI generation failed',
                    message: job.error || job.message || 'Unknown error',
                    duration: 6000,
                });
            } else if (job.status === 'cancelled') {
                showToast({
                    type: 'info',
                    title: 'AI generation cancelled',
                    message: 'The job was cancelled.',
                    duration: 4000,
                });
            }
        }
        previousJobStatusRef.current = job.status;
        if (job.status !== 'processing' && job.status !== 'queued') {
            setCancelling(false);
        }
    }, [job, showToast]);

    const status: 'idle' | 'processing' | 'completed' | 'failed' = (() => {
        if (job?.status === 'queued' || job?.status === 'processing') return 'processing';
        if (job?.status === 'failed' || job?.status === 'cancelled') return 'failed';
        if (job?.status === 'completed' || snap.aiContentGeneratedAt) return 'completed';
        return 'idle';
    })();
    const isProcessing = status === 'processing' || submitting;

    const generatedAt = useMemo(() => {
        if (!snap.aiContentGeneratedAt) return null;
        try {
            return new Date(snap.aiContentGeneratedAt).toLocaleString();
        } catch {
            return null;
        }
    }, [snap.aiContentGeneratedAt]);

    const canRun = Boolean(lessonId && videoUrl) && !isProcessing;

    const handleRun = async () => {
        if (!lessonId) {
            showToast({
                type: 'warning',
                title: 'Save the lesson first',
                message: 'AI generation requires an existing lesson with an uploaded video.',
                duration: 4000,
            });
            return;
        }
        if (!videoUrl) {
            showToast({
                type: 'warning',
                title: 'No video uploaded',
                message: 'Upload the lesson video before generating AI assets.',
                duration: 4000,
            });
            return;
        }
        setSubmitting(true);
        setModalOpen(true);
        try {
            const token = await firebaseAuth.currentUser?.getIdToken();
            if (!token) {
                showToast({ type: 'error', title: 'Not signed in', message: 'Please sign in again.' });
                setModalOpen(false);
                return;
            }
            const res = await fetch('/api/admin/lessons/ai-process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId, lessonId, videoUrl, language }),
            });
            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as { error?: string };
                showToast({
                    type: 'error',
                    title: 'Could not enqueue job',
                    message: data.error || `HTTP ${res.status}`,
                    duration: 6000,
                });
            } else {
                showToast({
                    type: 'success',
                    title: 'Job queued',
                    message:
                        'You can close this dialog and navigate freely — progress is in the AI Jobs tray.',
                    duration: 4000,
                });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexpected error';
            showToast({ type: 'error', title: 'Could not enqueue job', message: msg, duration: 6000 });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!job?.jobId || cancelling) return;
        setCancelling(true);
        try {
            const token = await firebaseAuth.currentUser?.getIdToken();
            if (!token) {
                showToast({ type: 'error', title: 'Not signed in', message: 'Please sign in again.' });
                setCancelling(false);
                return;
            }
            const res = await fetch('/api/admin/lessons/ai-process/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ jobId: job.jobId }),
            });
            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as { error?: string };
                showToast({
                    type: 'error',
                    title: 'Cancel failed',
                    message: data.error || `HTTP ${res.status}`,
                    duration: 5000,
                });
                setCancelling(false);
                return;
            }
            showToast({
                type: 'info',
                title: 'Cancelling…',
                message: 'Asked the server to stop. The job will end at the next safe checkpoint.',
                duration: 4000,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexpected error';
            showToast({ type: 'error', title: 'Cancel failed', message: msg, duration: 5000 });
            setCancelling(false);
        }
    };

    const captionLanguages = snap.captions ? Object.keys(snap.captions) : [];

    const modalState: AiProgressState = {
        status,
        stage: job?.stage,
        progress: job?.progress,
        message: job?.message,
        error: job?.error ?? null,
        transcription: job?.transcript ?? snap.transcription,
        transcriptionLanguage: job?.transcriptionLanguage ?? snap.transcriptionLanguage,
        summary: job?.summary ?? snap.summary,
        keyPoints: job?.keyPoints ?? snap.keyPoints,
        audioUrl: job?.audioUrl ?? snap.audioUrl,
        audioDurationSeconds: job?.audioDurationSeconds ?? snap.audioDurationSeconds,
        captions: snap.captions,
    };

    return (
        <div className="rounded-2xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[color:var(--ai-primary)]/5 via-[color:var(--ai-card-bg)] to-[color:var(--ai-secondary)]/5 p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-3 justify-between mb-4">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white text-xs font-bold">
                            AI
                        </span>
                        Audio, Transcript & Summary
                    </h3>
                    <p className="text-xs text-[color:var(--ai-muted)] mt-1 max-w-prose">
                        Extracts an MP3 audio track from the uploaded video, transcribes it with Azure
                        Speech, generates WEBVTT captions, and summarizes it via Azure OpenAI. Jobs run
                        on the server — you can close this dialog and navigate freely; the global AI
                        Jobs tray (top bar) shows progress for every running job.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-[180px]">
                        <Select
                            label=""
                            aria-label="Transcription language"
                            selectedKeys={[language]}
                            onSelectionChange={(key: unknown) => {
                                let k: string | undefined;
                                if (typeof key === 'string') {
                                    k = key;
                                } else if (
                                    key &&
                                    typeof (key as Iterable<string>)[Symbol.iterator] === 'function'
                                ) {
                                    k = Array.from(key as Iterable<string>)[0];
                                }
                                if (k) setLanguage(k);
                            }}
                            isDisabled={isProcessing}
                            size="sm"
                        >
                            {LANGUAGES.map((l) => (
                                <SelectItem key={l.code} itemKey={l.code}>
                                    {l.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    <Button
                        color="primary"
                        variant="primary"
                        size="md"
                        isDisabled={!canRun}
                        isLoading={isProcessing}
                        onPress={handleRun}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiPlay size={16} />
                            {snap.aiContentGeneratedAt ? 'Regenerate' : 'Generate'}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Status row */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
                {status === 'processing' && (
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 font-medium hover:bg-amber-500/20 transition cursor-pointer"
                    >
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        Processing… ({job?.progress ?? 0}%) · click for details
                    </button>
                )}
                {status === 'completed' && (
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 font-medium hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                        <FiCheckCircle size={14} />
                        Generated · click to review
                    </button>
                )}
                {status === 'failed' && (
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 font-medium hover:bg-red-500/20 transition cursor-pointer"
                    >
                        <FiAlertCircle size={14} />
                        {job?.status === 'cancelled' ? 'Cancelled' : 'Failed'} · click to view
                    </button>
                )}
                {generatedAt && (
                    <span className="inline-flex items-center gap-1.5 text-[color:var(--ai-muted)]">
                        <FiClock size={12} />
                        Last run: {generatedAt}
                    </span>
                )}
                {snap.audioDurationSeconds ? (
                    <span className="inline-flex items-center gap-1.5 text-[color:var(--ai-muted)]">
                        Duration: {formatDuration(snap.audioDurationSeconds)}
                    </span>
                ) : null}
            </div>

            {!videoUrl && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Upload the lesson video first — generation runs on the uploaded file.
                </p>
            )}

            {captionLanguages.length > 0 && (
                <p className="text-xs text-[color:var(--ai-muted)] mt-3">
                    Subtitle tracks: {captionLanguages.join(', ')}
                </p>
            )}

            <LessonAIProgressModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onApply={onApply}
                onCancel={
                    job && (job.status === 'queued' || job.status === 'processing')
                        ? handleCancel
                        : undefined
                }
                cancelling={cancelling}
                state={modalState}
                language={language}
            />
        </div>
    );
};

export default LessonAIProcessor;
