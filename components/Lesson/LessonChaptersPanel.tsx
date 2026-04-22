'use client';

/**
 * ChaptersPanel
 *
 * Reads the lesson's `chapters` and `currentAiJobId` (for processing state)
 * and renders an interactive table of contents next to / below the video.
 * Clicking a chapter seeks the page's main <video> element to that time and
 * plays it. The currently-playing chapter is highlighted.
 *
 * The component listens to the video's `timeupdate` event to keep the
 * highlight in sync without prop-drilling.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lesson } from '@/types';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';

function formatTime(s: number): string {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

interface Props {
    lesson: Lesson;
    /** Optional CSS selector for the video element. Defaults to the first <video> on the page. */
    videoSelector?: string;
}

export default function LessonChaptersPanel({ lesson, videoSelector = 'video' }: Props) {
    const chapters = lesson.chapters && lesson.chapters.length
        ? [...lesson.chapters].sort((a, b) => a.startSeconds - b.startSeconds)
        : [];
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (chapters.length === 0) return;
        let raf = 0;
        let video: HTMLVideoElement | null = null;
        const tick = () => {
            if (video) setCurrentTime(video.currentTime);
            raf = requestAnimationFrame(tick);
        };
        // Re-query a couple of times in case the player mounts after us.
        const tryAttach = () => {
            video = document.querySelector(videoSelector) as HTMLVideoElement | null;
            if (video) {
                raf = requestAnimationFrame(tick);
            } else {
                setTimeout(tryAttach, 250);
            }
        };
        tryAttach();
        return () => { if (raf) cancelAnimationFrame(raf); };
    }, [chapters.length, videoSelector]);

    if (chapters.length === 0) return null;

    const activeIdx = (() => {
        let idx = -1;
        for (let i = 0; i < chapters.length; i++) {
            if (chapters[i].startSeconds <= currentTime) idx = i;
            else break;
        }
        return idx;
    })();

    const handleClick = (start: number) => {
        const video = document.querySelector(videoSelector) as HTMLVideoElement | null;
        if (!video) return;
        video.currentTime = start;
        video.play().catch(() => undefined);
    };

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-[color:var(--ai-primary)]/15 text-[color:var(--ai-primary)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </span>
                    <h3 className="text-base font-semibold text-[color:var(--ai-foreground)]">
                        Chapters
                    </h3>
                </div>
                <span className="text-xs text-[color:var(--ai-muted)]">
                    {chapters.length} sections
                </span>
            </CardHeader>
            <CardBody className="p-2 max-h-[420px] overflow-y-auto">
                <ol className="flex flex-col gap-1">
                    <AnimatePresence initial={false}>
                        {chapters.map((c, i) => {
                            const isActive = i === activeIdx;
                            return (
                                <motion.li
                                    key={c.id}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15, delay: i * 0.01 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleClick(c.startSeconds)}
                                        className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition-all duration-150 group ${isActive
                                            ? 'bg-[color:var(--ai-primary)]/10 ring-1 ring-[color:var(--ai-primary)]/40'
                                            : 'hover:bg-[color:var(--ai-card-border)]/30'
                                            }`}
                                    >
                                        <span className={`mt-0.5 inline-flex items-center justify-center min-w-[52px] px-2 py-0.5 rounded text-xs font-mono tabular-nums ${isActive
                                            ? 'bg-[color:var(--ai-primary)] text-white'
                                            : 'bg-[color:var(--ai-card-border)]/50 text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)]'
                                            }`}>
                                            {formatTime(c.startSeconds)}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className={`block text-sm font-medium leading-snug ${isActive ? 'text-[color:var(--ai-primary)]' : 'text-[color:var(--ai-foreground)]'}`}>
                                                {c.title}
                                            </span>
                                            {c.summary && (
                                                <span className="block text-xs text-[color:var(--ai-muted)] mt-0.5 line-clamp-2">
                                                    {c.summary}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ol>
            </CardBody>
        </Card>
    );
}
