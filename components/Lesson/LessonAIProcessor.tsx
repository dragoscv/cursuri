'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';
import Button from '@/components/ui/Button';
import Select, { SelectItem } from '@/components/ui/Select';
import {
  FiPlay,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiList,
  FiClock,
} from '@/components/icons/FeatherIcons';

const FiVolume2: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
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

interface LessonAIProcessorProps {
  courseId: string;
  lessonId?: string; // if absent, the form is in "create" mode and we hide the action
  videoUrl?: string;
}

interface LessonAiState {
  audioUrl?: string;
  audioFileName?: string;
  audioDurationSeconds?: number | null;
  transcription?: string;
  transcriptionLanguage?: string;
  summary?: string;
  keyPoints?: string[];
  aiContentGeneratedAt?: number;
  aiProcessingStatus?: 'idle' | 'processing' | 'completed' | 'failed';
  aiProcessingError?: string | null;
  captions?: Record<string, { url?: string }>;
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

const LessonAIProcessor: React.FC<LessonAIProcessorProps> = ({ courseId, lessonId, videoUrl }) => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState('en-US');
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<LessonAiState>({});

  // Live-subscribe to lesson document so the panel updates as the route writes back.
  useEffect(() => {
    if (!courseId || !lessonId) return;
    const ref = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data() as LessonAiState;
      setState({
        audioUrl: d.audioUrl,
        audioFileName: d.audioFileName,
        audioDurationSeconds: d.audioDurationSeconds,
        transcription: d.transcription,
        transcriptionLanguage: d.transcriptionLanguage,
        summary: d.summary,
        keyPoints: d.keyPoints,
        aiContentGeneratedAt: d.aiContentGeneratedAt,
        aiProcessingStatus: d.aiProcessingStatus,
        aiProcessingError: d.aiProcessingError,
        captions: d.captions,
      });
      if (d.transcriptionLanguage) setLanguage(d.transcriptionLanguage);
    });
    return () => unsub();
  }, [courseId, lessonId]);

  const status = state.aiProcessingStatus || 'idle';
  const isProcessing = status === 'processing' || submitting;

  const generatedAt = useMemo(() => {
    if (!state.aiContentGeneratedAt) return null;
    try {
      return new Date(state.aiContentGeneratedAt).toLocaleString();
    } catch {
      return null;
    }
  }, [state.aiContentGeneratedAt]);

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
    try {
      const token = await firebaseAuth.currentUser?.getIdToken();
      if (!token) {
        showToast({ type: 'error', title: 'Not signed in', message: 'Please sign in again.' });
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
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast({
          type: 'error',
          title: 'Generation failed',
          message: data.error || `HTTP ${res.status}`,
          duration: 6000,
        });
        return;
      }
      showToast({
        type: 'success',
        title: 'AI assets generated',
        message: 'Audio, transcript, captions and summary saved on the lesson.',
        duration: 5000,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      showToast({ type: 'error', title: 'Generation failed', message: msg, duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  const captionLanguages = state.captions ? Object.keys(state.captions) : [];

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
            Extracts an MP3 audio track from the uploaded video, transcribes it with Azure Speech,
            generates WEBVTT captions, and summarizes it via Azure OpenAI. All artifacts are saved
            on the lesson and displayed to learners on the public lesson page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[180px]">
            <Select
              label=""
              aria-label="Transcription language"
              selectedKeys={[language]}
              onSelectionChange={(keys: any) => {
                const k = Array.from(keys as Set<string>)[0];
                if (k) setLanguage(k);
              }}
              isDisabled={isProcessing}
              size="sm"
            >
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} itemKey={l.code}>{l.label}</SelectItem>
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
              {state.aiContentGeneratedAt ? 'Regenerate' : 'Generate'}
            </span>
          </Button>
        </div>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
        {status === 'processing' && (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Processing… this can take a few minutes
          </span>
        )}
        {status === 'completed' && (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 font-medium">
            <FiCheckCircle size={14} />
            Generated
          </span>
        )}
        {status === 'failed' && (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 font-medium">
            <FiAlertCircle size={14} />
            Failed{state.aiProcessingError ? `: ${state.aiProcessingError}` : ''}
          </span>
        )}
        {generatedAt && (
          <span className="inline-flex items-center gap-1.5 text-[color:var(--ai-muted)]">
            <FiClock size={12} />
            Last run: {generatedAt}
          </span>
        )}
        {state.audioDurationSeconds ? (
          <span className="inline-flex items-center gap-1.5 text-[color:var(--ai-muted)]">
            Duration: {formatDuration(state.audioDurationSeconds)}
          </span>
        ) : null}
      </div>

      {!videoUrl && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Upload the lesson video first — generation runs on the uploaded file.
        </p>
      )}

      {/* Audio */}
      {state.audioUrl && (
        <div className="mt-2 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-sm font-medium text-[color:var(--ai-foreground)] inline-flex items-center gap-2">
              <FiVolume2 size={16} className="text-[color:var(--ai-primary)]" />
              Audio track
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

      {/* Captions */}
      {captionLanguages.length > 0 && (
        <div className="mt-4 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-4">
          <div className="text-sm font-medium text-[color:var(--ai-foreground)] inline-flex items-center gap-2 mb-2">
            <FiList size={16} className="text-[color:var(--ai-primary)]" />
            Subtitle tracks (WEBVTT)
          </div>
          <ul className="flex flex-wrap gap-2 text-xs">
            {captionLanguages.map((lang) => (
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

      {/* Summary */}
      {state.summary && (
        <div className="mt-4 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-4">
          <div className="text-sm font-medium text-[color:var(--ai-foreground)] inline-flex items-center gap-2 mb-2">
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

      {/* Transcript preview */}
      {state.transcription && (
        <details className="mt-4 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 p-4 group">
          <summary className="cursor-pointer text-sm font-medium text-[color:var(--ai-foreground)] inline-flex items-center gap-2">
            <FiFileText size={16} className="text-[color:var(--ai-primary)]" />
            Full transcript ({state.transcriptionLanguage || language})
            <span className="ml-2 text-xs text-[color:var(--ai-muted)]">
              {state.transcription.length.toLocaleString()} chars · click to expand
            </span>
          </summary>
          <div className="mt-3 max-h-72 overflow-y-auto text-sm text-[color:var(--ai-text-secondary)] whitespace-pre-line leading-relaxed">
            {state.transcription}
          </div>
        </details>
      )}
    </div>
  );
};

export default LessonAIProcessor;
