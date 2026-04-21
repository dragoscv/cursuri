'use client';

import React from 'react';
import AppModal from '@/components/shared/ui/AppModal';
import Button from '@/components/ui/Button';
import {
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiList,
    FiClock,
} from '@/components/icons/FeatherIcons';

const FiVolume2: React.FC<{ size?: number; className?: string }> = ({
    size = 16,
    className = '',
}) => (
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
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

export type AiStage =
    | 'queued'
    | 'downloading'
    | 'extracting_audio'
    | 'transcribing'
    | 'summarizing'
    | 'uploading'
    | 'finalizing'
    | 'completed'
    | 'failed';

export interface AiProgressState {
    status: 'idle' | 'processing' | 'completed' | 'failed';
    stage?: AiStage;
    progress?: number; // 0-100
    message?: string;
    error?: string | null;
    transcription?: string;
    transcriptionLanguage?: string;
    summary?: string;
    keyPoints?: string[];
    audioUrl?: string;
    audioDurationSeconds?: number | null;
    captions?: Record<string, { url?: string }>;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onApply?: (data: { transcription?: string }) => void;
    onCancel?: () => void;
    cancelling?: boolean;
    state: AiProgressState;
    language: string;
}

const STAGES: { key: AiStage; label: string }[] = [
    { key: 'downloading', label: 'Download video' },
    { key: 'extracting_audio', label: 'Extract audio (MP3 + WAV)' },
    { key: 'transcribing', label: 'Transcribe with Azure Speech' },
    { key: 'summarizing', label: 'Summarize with Azure OpenAI' },
    { key: 'uploading', label: 'Upload audio + WEBVTT' },
    { key: 'finalizing', label: 'Save on the lesson' },
];

const STAGE_ORDER: AiStage[] = [
    'queued',
    'downloading',
    'extracting_audio',
    'transcribing',
    'summarizing',
    'uploading',
    'finalizing',
    'completed',
];

function stageIndex(s?: AiStage): number {
    if (!s) return -1;
    const idx = STAGE_ORDER.indexOf(s);
    return idx === -1 ? -1 : idx;
}

function formatDuration(s?: number | null): string {
    if (!s || s <= 0) return '—';
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

const Spinner: React.FC = () => (
    <span
        className="inline-block h-4 w-4 rounded-full border-2 border-[color:var(--ai-primary)] border-t-transparent animate-spin"
        aria-hidden="true"
    />
);

const LessonAIProgressModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onApply,
    onCancel,
    cancelling = false,
    state,
    language,
}) => {
    const isDone = state.status === 'completed';
    const isFailed = state.status === 'failed';
    const isRunning = state.status === 'processing';
    const currentIdx = isDone ? STAGE_ORDER.indexOf('completed') : stageIndex(state.stage);
    const progress = Math.max(0, Math.min(100, state.progress ?? (isDone ? 100 : 0)));

    const tone: 'primary' | 'success' | 'danger' = isDone
        ? 'success'
        : isFailed
            ? 'danger'
            : 'primary';

    const title = isDone
        ? 'AI assets generated'
        : isFailed
            ? 'Generation failed'
            : 'Generating lesson AI assets…';

    const subtitle = isRunning
        ? 'Keep this tab open. Progress is saved on the lesson document so you can come back later if you close it.'
        : isDone
            ? 'Audio, captions, transcript and summary saved on this lesson. Click Update Lesson to keep your other edits.'
            : isFailed
                ? 'The pipeline stopped. Close this dialog and try again.'
                : '';

    const icon = (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white text-xs font-bold">
            AI
        </span>
    );

    const footer = isDone ? (
        <>
            <Button variant="bordered" onPress={onClose}>
                Close
            </Button>
            {onApply && state.transcription && (
                <Button
                    color="primary"
                    variant="primary"
                    onPress={() => {
                        onApply({ transcription: state.transcription });
                        onClose();
                    }}
                >
                    Apply transcript to form
                </Button>
            )}
        </>
    ) : isFailed ? (
        <Button variant="bordered" onPress={onClose}>
            Close
        </Button>
    ) : (
        <>
            <span className="text-xs text-[color:var(--ai-muted)] mr-auto">
                You can safely close this dialog — the job continues on the server.
            </span>
            <Button variant="bordered" onPress={onClose}>
                Close
            </Button>
            {onCancel && (
                <Button
                    color="danger"
                    variant="bordered"
                    isLoading={cancelling}
                    isDisabled={cancelling}
                    onPress={onCancel}
                >
                    {cancelling ? 'Cancelling…' : 'Cancel job'}
                </Button>
            )}
        </>
    );

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            tone={tone}
            title={title}
            subtitle={subtitle}
            icon={icon}
            isDismissable={true}
            hideCloseButton={false}
            scrollBehavior="inside"
            footer={footer}
            bodyClassName="space-y-4"
        >
            {/* Progress bar */}
            <div>
                <div className="flex items-center justify-between text-xs text-[color:var(--ai-muted)] mb-1.5">
                    <span className="font-medium text-[color:var(--ai-foreground)]">
                        {isFailed
                            ? 'Stopped'
                            : isDone
                                ? 'Complete'
                                : `Step ${Math.max(1, currentIdx)} of ${STAGES.length}`}
                    </span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[color:var(--ai-card-border)] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isFailed
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {state.message && (
                    <p className="mt-2 text-xs text-[color:var(--ai-text-secondary)]">
                        {state.message}
                    </p>
                )}
                {isFailed && state.error && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400 inline-flex items-start gap-1.5">
                        <FiAlertCircle size={14} className="mt-0.5 flex-none" />
                        <span>{state.error}</span>
                    </p>
                )}
            </div>

            {/* Stage checklist */}
            <ul className="space-y-1.5">
                {STAGES.map((s) => {
                    const idx = STAGE_ORDER.indexOf(s.key);
                    const done = isDone || idx < currentIdx;
                    const active = !isDone && idx === currentIdx;
                    const failed = isFailed && active;
                    return (
                        <li
                            key={s.key}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm border ${active
                                ? 'border-[color:var(--ai-primary)]/40 bg-[color:var(--ai-primary)]/5'
                                : done
                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                    : 'border-[color:var(--ai-card-border)] bg-transparent'
                                }`}
                        >
                            <span className="flex-none w-4 h-4 inline-flex items-center justify-center">
                                {failed ? (
                                    <FiAlertCircle size={16} className="text-red-500" />
                                ) : done ? (
                                    <FiCheckCircle size={16} className="text-emerald-500" />
                                ) : active ? (
                                    <Spinner />
                                ) : (
                                    <span className="h-2 w-2 rounded-full bg-[color:var(--ai-muted)]/50" />
                                )}
                            </span>
                            <span
                                className={`flex-1 ${active
                                    ? 'text-[color:var(--ai-foreground)] font-medium'
                                    : done
                                        ? 'text-[color:var(--ai-foreground)]'
                                        : 'text-[color:var(--ai-muted)]'
                                    }`}
                            >
                                {s.label}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {/* Result preview */}
            {isDone && (
                <div className="space-y-3 mt-2 border-t border-[color:var(--ai-card-border)] pt-4">
                    {state.audioUrl && (
                        <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="text-sm font-medium inline-flex items-center gap-2">
                                    <FiVolume2 size={16} className="text-[color:var(--ai-primary)]" />
                                    Audio track
                                    {state.audioDurationSeconds ? (
                                        <span className="text-xs font-normal text-[color:var(--ai-muted)] inline-flex items-center gap-1">
                                            <FiClock size={11} />
                                            {formatDuration(state.audioDurationSeconds)}
                                        </span>
                                    ) : null}
                                </div>
                                <a
                                    href={state.audioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-[color:var(--ai-primary)] hover:underline"
                                >
                                    Download MP3
                                </a>
                            </div>
                            <audio src={state.audioUrl} controls preload="none" className="w-full" />
                        </div>
                    )}

                    {state.captions && Object.keys(state.captions).length > 0 && (
                        <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-3">
                            <div className="text-sm font-medium inline-flex items-center gap-2 mb-2">
                                <FiList size={16} className="text-[color:var(--ai-primary)]" />
                                Subtitle tracks (WEBVTT)
                            </div>
                            <ul className="flex flex-wrap gap-2 text-xs">
                                {Object.keys(state.captions).map((lang) => (
                                    <li key={lang}>
                                        <a
                                            href={state.captions?.[lang]?.url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)] hover:text-[color:var(--ai-primary)] transition"
                                        >
                                            {lang}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {state.summary && (
                        <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-3">
                            <div className="text-sm font-medium inline-flex items-center gap-2 mb-2">
                                <FiFileText size={16} className="text-[color:var(--ai-primary)]" />
                                Summary
                            </div>
                            <p className="text-sm text-[color:var(--ai-text-secondary)] leading-relaxed whitespace-pre-line">
                                {state.summary}
                            </p>
                            {state.keyPoints && state.keyPoints.length > 0 && (
                                <ul className="mt-3 space-y-1 text-sm text-[color:var(--ai-text-secondary)] list-disc pl-5">
                                    {state.keyPoints.map((p, i) => (
                                        <li key={i}>{p}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {state.transcription && (
                        <details className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-3 group">
                            <summary className="cursor-pointer text-sm font-medium inline-flex items-center gap-2">
                                <FiFileText size={16} className="text-[color:var(--ai-primary)]" />
                                Full transcript ({state.transcriptionLanguage || language})
                                <span className="ml-2 text-xs text-[color:var(--ai-muted)]">
                                    {state.transcription.length.toLocaleString()} chars · click to
                                    expand
                                </span>
                            </summary>
                            <div className="mt-3 max-h-72 overflow-y-auto text-sm text-[color:var(--ai-text-secondary)] whitespace-pre-line leading-relaxed">
                                {state.transcription}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </AppModal>
    );
};

export default LessonAIProgressModal;
