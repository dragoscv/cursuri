'use client';

/**
 * LessonChaptersEditor
 *
 * Admin-side CRUD editor for the lesson's `chapters` array. Lets the
 * instructor:
 *   - See AI-generated chapters as an editable list
 *   - Edit each chapter title and start time (mm:ss or h:mm:ss)
 *   - Add a new chapter (defaults to current video position if available)
 *   - Delete a chapter
 *   - Re-order via up/down buttons
 *   - Save the array back to Firestore
 *
 * When the admin saves, we also flip `chaptersManuallyEdited: true` so the
 * AI pipeline knows to preserve the user's edits on subsequent re-runs.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import type { LessonChapter } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/Toast/ToastContext';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiSave } from '../icons/FeatherIcons';

interface Props {
    courseId: string;
    lessonId: string;
    initialChapters?: LessonChapter[];
    /** Current player time in seconds, used as default for "Add chapter at current time". Optional. */
    currentVideoSeconds?: number;
}

function newId(): string {
    return 'ch_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function parseTime(input: string): number | null {
    if (!input) return null;
    const trimmed = input.trim();
    // Accept seconds, m:ss, h:mm:ss
    const parts = trimmed.split(':').map((p) => p.trim());
    if (parts.some((p) => !/^\d+$/.test(p))) return null;
    const nums = parts.map((p) => parseInt(p, 10));
    if (nums.length === 1) return nums[0];
    if (nums.length === 2) return nums[0] * 60 + nums[1];
    if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
    return null;
}

function formatTime(s: number): string {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function LessonChaptersEditor({
    courseId,
    lessonId,
    initialChapters,
    currentVideoSeconds,
}: Props) {
    const { showToast } = useToast();
    const [rows, setRows] = useState<LessonChapter[]>(() => initialChapters ?? []);
    const [originalKey, setOriginalKey] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Re-sync when the lesson doc updates (e.g. AI just regenerated).
    useEffect(() => {
        const next = initialChapters ?? [];
        const key = JSON.stringify(next);
        setRows(next);
        setOriginalKey(key);
    }, [initialChapters]);

    const dirty = useMemo(() => JSON.stringify(rows) !== originalKey, [rows, originalKey]);

    const addRow = useCallback(() => {
        const start = Number.isFinite(currentVideoSeconds) ? Math.max(0, Math.round(currentVideoSeconds!)) : 0;
        setRows((prev) => {
            const next = [...prev, { id: newId(), title: 'New chapter', startSeconds: start }];
            next.sort((a, b) => a.startSeconds - b.startSeconds);
            return next;
        });
    }, [currentVideoSeconds]);

    const removeRow = useCallback((id: string) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const move = useCallback((id: string, dir: -1 | 1) => {
        setRows((prev) => {
            const idx = prev.findIndex((r) => r.id === id);
            if (idx < 0) return prev;
            const target = idx + dir;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[idx], next[target]] = [next[target], next[idx]];
            // Swap their start seconds too so order matches time order
            const t = next[idx].startSeconds;
            next[idx].startSeconds = next[target].startSeconds;
            next[target].startSeconds = t;
            return next;
        });
    }, []);

    const updateField = useCallback((id: string, patch: Partial<LessonChapter>) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }, []);

    const sortAndValidate = useCallback((): { ok: true; sorted: LessonChapter[] } | { ok: false; error: string } => {
        if (rows.length === 0) return { ok: true, sorted: [] };
        const cleaned = rows.map((r) => ({
            ...r,
            title: (r.title || '').trim(),
            startSeconds: Math.max(0, Math.round(r.startSeconds || 0)),
        }));
        if (cleaned.some((r) => r.title.length === 0)) {
            return { ok: false, error: 'All chapters must have a title.' };
        }
        const sorted = [...cleaned].sort((a, b) => a.startSeconds - b.startSeconds);
        // Ensure unique start times
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].startSeconds <= sorted[i - 1].startSeconds) {
                sorted[i].startSeconds = sorted[i - 1].startSeconds + 1;
            }
        }
        return { ok: true, sorted };
    }, [rows]);

    const save = useCallback(async () => {
        const validated = sortAndValidate();
        if (!validated.ok) { showToast({ message: validated.error, type: 'error' }); return; }
        if (!courseId || !lessonId) { showToast({ message: 'Missing course or lesson id', type: 'error' }); return; }
        setSaving(true);
        try {
            await updateDoc(doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`), {
                chapters: validated.sorted,
                chaptersManuallyEdited: validated.sorted.length > 0,
                lastModified: Date.now(),
            });
            setRows(validated.sorted);
            setOriginalKey(JSON.stringify(validated.sorted));
            showToast({ message: 'Chapters saved', type: 'success' });
        } catch (err) {
            console.error('Failed to save chapters', err);
            showToast({ message: err instanceof Error ? err.message : 'Failed to save chapters', type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [sortAndValidate, courseId, lessonId, showToast]);

    const resetEditedFlag = useCallback(async () => {
        if (!courseId || !lessonId) return;
        setSaving(true);
        try {
            await updateDoc(doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`), {
                chaptersManuallyEdited: false,
                lastModified: Date.now(),
            });
            showToast({ message: 'AI may now overwrite chapters on next run', type: 'info' });
        } catch (err) {
            console.error(err);
            showToast({ message: 'Failed to update flag', type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [courseId, lessonId, showToast]);

    return (
        <div className="border border-[color:var(--ai-card-border)] rounded-xl bg-[color:var(--ai-card-bg)]/60 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                    <h4 className="text-sm font-semibold text-[color:var(--ai-foreground)]">
                        AI Chapters
                    </h4>
                    <p className="text-xs text-[color:var(--ai-muted)] mt-0.5">
                        {rows.length === 0
                            ? 'No chapters yet. Run AI processing or add one manually.'
                            : `${rows.length} chapter${rows.length === 1 ? '' : 's'}. Saving marks them as manually edited so AI won't overwrite next time.`}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={addRow} aria-label="Add chapter">
                        <FiPlus className="w-4 h-4" /> Add
                    </Button>
                    <Button
                        size="sm"
                        color="primary"
                        onClick={save}
                        isDisabled={!dirty || saving}
                        aria-label="Save chapters"
                    >
                        <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="text-center py-8 text-xs text-[color:var(--ai-muted)]">
                    Run AI processing on this lesson, or click <span className="font-medium">Add</span> to start a chapter manually.
                </div>
            ) : (
                <ul className="flex flex-col gap-2">
                    {rows.map((c, i) => (
                        <li
                            key={c.id}
                            className="grid grid-cols-[auto_110px_1fr_auto] items-center gap-2 p-2 rounded-lg bg-[color:var(--ai-background)]/40 border border-[color:var(--ai-card-border)]/40"
                        >
                            <div className="flex flex-col">
                                <button
                                    type="button"
                                    onClick={() => move(c.id, -1)}
                                    disabled={i === 0}
                                    className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[color:var(--ai-muted)]"
                                    aria-label="Move up"
                                >
                                    <FiArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(c.id, 1)}
                                    disabled={i === rows.length - 1}
                                    className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[color:var(--ai-muted)]"
                                    aria-label="Move down"
                                >
                                    <FiArrowDown className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <Input
                                value={formatTime(c.startSeconds)}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const parsed = parseTime(e.target.value);
                                    if (parsed != null) updateField(c.id, { startSeconds: parsed });
                                }}
                                placeholder="m:ss"
                                aria-label="Chapter start time"
                                className="font-mono text-xs"
                            />
                            <Input
                                value={c.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(c.id, { title: e.target.value })}
                                placeholder="Chapter title"
                                aria-label="Chapter title"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                color="danger"
                                onClick={() => removeRow(c.id)}
                                aria-label="Delete chapter"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {rows.length > 0 && (
                <div className="mt-3 flex items-center justify-end">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={resetEditedFlag}
                        isDisabled={saving}
                        aria-label="Allow AI to overwrite"
                        title="Allow the AI to overwrite these chapters on the next processing run"
                    >
                        Allow AI overwrite
                    </Button>
                </div>
            )}
        </div>
    );
}
