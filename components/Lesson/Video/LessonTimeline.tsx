'use client';

/**
 * LessonTimeline
 *
 * Replaces the basic flat progress bar with a richer scrubber that combines:
 *  - A pre-computed waveform (loaded as JSON from `waveformUrl`).
 *  - Speech-region highlights (bright bars where the lecturer is talking;
 *    dimmed bars for silence).
 *  - Chapter ticks rendered above the waveform with hover-to-preview titles.
 *  - Standard play head + click/drag to seek.
 *  - Hover scrubber tooltip showing the time and the chapter at that point.
 *
 * Designed to be drop-in for the existing flat progress bar in VideoPlayer.
 * All seeking goes through `onSeek(seconds)` so the parent can keep its
 * own video ref logic.
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { LessonChapter, LessonSpeechSegment } from '@/types';

interface Props {
    durationSeconds: number;
    currentSeconds: number;
    bufferedSeconds?: number;
    waveformUrl?: string;
    speechSegments?: LessonSpeechSegment[];
    chapters?: LessonChapter[];
    onSeek: (seconds: number) => void;
    /** Optional: jump to next speech segment (rendered as a small button). */
    onJumpToNextSpeech?: () => void;
    className?: string;
}

const PEAK_BUCKETS = 600;

function formatTime(s: number): string {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function LessonTimeline({
    durationSeconds,
    currentSeconds,
    bufferedSeconds,
    waveformUrl,
    speechSegments,
    chapters,
    onSeek,
    onJumpToNextSpeech,
    className,
}: Props) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [peaks, setPeaks] = useState<number[] | null>(null);
    const [hoverX, setHoverX] = useState<number | null>(null);
    const [width, setWidth] = useState(0);
    const [dragging, setDragging] = useState(false);

    // Load waveform JSON once per URL
    useEffect(() => {
        if (!waveformUrl) { setPeaks(null); return; }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(waveformUrl, { cache: 'force-cache' });
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled && Array.isArray(json.peaks)) setPeaks(json.peaks);
            } catch {
                /* ignore — we'll just render a flat bar */
            }
        })();
        return () => { cancelled = true; };
    }, [waveformUrl]);

    // Track width for chapter pixel positioning.
    useEffect(() => {
        if (!trackRef.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) setWidth(e.contentRect.width);
        });
        ro.observe(trackRef.current);
        return () => ro.disconnect();
    }, []);

    const safeDuration = Math.max(durationSeconds || 0, 0.001);
    const playheadPct = Math.min(100, (currentSeconds / safeDuration) * 100);
    const bufferPct = bufferedSeconds
        ? Math.min(100, (bufferedSeconds / safeDuration) * 100)
        : 0;

    // Pre-compute which buckets are "speech" so we can color-code waveform bars.
    const speechMask = useMemo(() => {
        const mask = new Uint8Array(PEAK_BUCKETS);
        if (!speechSegments || !speechSegments.length) return mask;
        for (const seg of speechSegments) {
            const a = Math.floor((seg.startSeconds / safeDuration) * PEAK_BUCKETS);
            const b = Math.ceil((seg.endSeconds / safeDuration) * PEAK_BUCKETS);
            for (let i = Math.max(0, a); i < Math.min(PEAK_BUCKETS, b); i++) mask[i] = 1;
        }
        return mask;
    }, [speechSegments, safeDuration]);

    const sortedChapters = useMemo(() => {
        if (!chapters || chapters.length === 0) return [];
        return [...chapters].sort((a, b) => a.startSeconds - b.startSeconds);
    }, [chapters]);

    const activeChapterIdx = useMemo(() => {
        if (sortedChapters.length === 0) return -1;
        let idx = -1;
        for (let i = 0; i < sortedChapters.length; i++) {
            if (sortedChapters[i].startSeconds <= currentSeconds) idx = i;
            else break;
        }
        return idx;
    }, [sortedChapters, currentSeconds]);

    const computeSeekFromClientX = useCallback((clientX: number) => {
        const el = trackRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        return ratio * safeDuration;
    }, [safeDuration]);

    const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setHoverX(e.clientX - rect.left);
        if (dragging) {
            const t = computeSeekFromClientX(e.clientX);
            if (t != null) onSeek(t);
        }
    }, [dragging, computeSeekFromClientX, onSeek]);

    const handleLeave = useCallback(() => setHoverX(null), []);

    const handleDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
        const t = computeSeekFromClientX(e.clientX);
        if (t != null) onSeek(t);
    }, [computeSeekFromClientX, onSeek]);

    useEffect(() => {
        if (!dragging) return;
        const onUp = () => setDragging(false);
        const onMove = (e: MouseEvent) => {
            const t = computeSeekFromClientX(e.clientX);
            if (t != null) onSeek(t);
        };
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        return () => {
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
        };
    }, [dragging, computeSeekFromClientX, onSeek]);

    const hoverTime = hoverX != null && width > 0 ? (hoverX / width) * safeDuration : null;
    const hoverChapter = hoverTime != null && sortedChapters.length > 0
        ? [...sortedChapters].reverse().find((c) => c.startSeconds <= hoverTime)
        : null;

    const hasWaveform = peaks != null && peaks.length > 0;
    const renderedPeaks = hasWaveform ? peaks! : null;

    return (
        <div className={`relative w-full select-none ${className || ''}`}>
            {/* Chapter ticks (above the bar) */}
            {sortedChapters.length > 0 && width > 0 && (
                <div className="relative h-3 mb-1">
                    {sortedChapters.map((c, i) => {
                        const left = (c.startSeconds / safeDuration) * width;
                        const isActive = i === activeChapterIdx;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onSeek(c.startSeconds); }}
                                className="absolute -translate-x-1/2 top-0 group/chap"
                                style={{ left }}
                                aria-label={`Jump to chapter: ${c.title}`}
                                title={`${formatTime(c.startSeconds)} — ${c.title}`}
                            >
                                <span className={`block h-3 w-[2px] rounded-full transition-all ${isActive ? 'bg-[color:var(--ai-primary)]' : 'bg-white/70 group-hover/chap:bg-white'}`} />
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap rounded bg-black/85 text-white text-[10px] px-2 py-1 opacity-0 group-hover/chap:opacity-100 transition-opacity max-w-[220px] truncate">
                                    {formatTime(c.startSeconds)} — {c.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Track */}
            <div
                ref={trackRef}
                className="relative w-full cursor-pointer"
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                onMouseDown={handleDown}
                style={{ height: hasWaveform ? 36 : 14 }}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={Math.round(safeDuration)}
                aria-valuenow={Math.round(currentSeconds)}
                aria-label="Video timeline"
            >
                {/* Background waveform / flat track */}
                {hasWaveform ? (
                    <svg
                        viewBox={`0 0 ${PEAK_BUCKETS} 100`}
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full"
                        aria-hidden
                    >
                        {renderedPeaks!.slice(0, PEAK_BUCKETS).map((p, i) => {
                            const h = Math.max(2, p * 92);
                            const isSpeech = speechMask[i] === 1;
                            const isPlayed = (i / PEAK_BUCKETS) * 100 <= playheadPct;
                            // Color: played + speech = primary; played + silence = primary dim;
                            // unplayed + speech = white/70; unplayed + silence = white/25.
                            const fill = isPlayed
                                ? (isSpeech ? 'var(--ai-primary, #60a5fa)' : 'rgba(96,165,250,0.35)')
                                : (isSpeech ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)');
                            return (
                                <rect
                                    key={i}
                                    x={i + 0.15}
                                    y={50 - h / 2}
                                    width={0.7}
                                    height={h}
                                    fill={fill}
                                />
                            );
                        })}
                    </svg>
                ) : (
                    <>
                        {/* Speech-segment overlay on flat bar so the user still sees where speech is */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/15 rounded-full overflow-hidden">
                            {speechSegments?.map((s, i) => (
                                <span
                                    key={i}
                                    className="absolute top-0 bottom-0 bg-white/55"
                                    style={{
                                        left: `${(s.startSeconds / safeDuration) * 100}%`,
                                        width: `${((s.endSeconds - s.startSeconds) / safeDuration) * 100}%`,
                                    }}
                                />
                            ))}
                            <div
                                className="absolute inset-y-0 left-0 bg-white/25"
                                style={{ width: `${bufferPct}%` }}
                            />
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                style={{ width: `${playheadPct}%` }}
                            />
                        </div>
                    </>
                )}

                {/* Buffered overlay for waveform mode */}
                {hasWaveform && bufferPct > 0 && (
                    <div
                        className="pointer-events-none absolute top-0 bottom-0 left-0 bg-white/5"
                        style={{ width: `${bufferPct}%` }}
                    />
                )}

                {/* Playhead */}
                <div
                    className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                    style={{ left: `${playheadPct}%`, transform: 'translateX(-50%)' }}
                />

                {/* Hover scrubber preview */}
                {hoverX != null && hoverTime != null && (
                    <div
                        className="pointer-events-none absolute -top-9 z-10 rounded bg-black/90 text-white text-[11px] px-2 py-1 whitespace-nowrap shadow-lg"
                        style={{ left: hoverX, transform: 'translateX(-50%)' }}
                    >
                        <span className="font-medium">{formatTime(hoverTime)}</span>
                        {hoverChapter && (
                            <span className="ml-2 text-white/70 max-w-[180px] inline-block truncate align-middle">
                                {hoverChapter.title}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Optional jump-to-next-speech control */}
            {onJumpToNextSpeech && speechSegments && speechSegments.length > 0 && (
                <button
                    type="button"
                    onClick={onJumpToNextSpeech}
                    className="absolute -top-7 right-0 text-[10px] uppercase tracking-wide text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded px-2 py-0.5 backdrop-blur"
                    aria-label="Skip to next spoken segment"
                >
                    Skip silence →
                </button>
            )}
        </div>
    );
}
