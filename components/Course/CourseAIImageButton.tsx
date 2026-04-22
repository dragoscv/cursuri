'use client';

/**
 * CourseAIImageButton — generates a course cover image with Azure OpenAI
 * gpt-image-1 from the course content. The server picks a vivid prompt
 * (or uses the optional admin-supplied style hint) and renders a 16:9 PNG
 * uploaded to Firebase Storage; the button calls back with the public URL
 * + the prompt that was used.
 */

import React, { useState } from 'react';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';

interface Props {
    courseId?: string;
    /** Disable when no lessons or no course context. */
    disabled?: boolean;
    /** Receives the generated public image URL + the prompt that produced it. */
    onGenerated: (data: { imageUrl: string; prompt: string }) => void;
    /** Optional admin-supplied art-direction (e.g. "isometric", "neon cyberpunk"). */
    style?: string;
    className?: string;
}

const CourseAIImageButton: React.FC<Props> = ({ courseId, disabled, onGenerated, style, className }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const isDisabled = disabled || loading || !courseId;

    const handleClick = async () => {
        if (isDisabled) return;
        setLoading(true);
        try {
            const token = await firebaseAuth.currentUser?.getIdToken();
            if (!token) {
                showToast({ type: 'error', title: 'Not signed in', message: 'Please sign in again.' });
                return;
            }
            const res = await fetch('/api/admin/courses/ai-generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    courseId,
                    customStyle: style,
                    size: '1536x1024',
                    quality: 'high',
                }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                imageUrl?: string;
                prompt?: string;
                error?: string;
            };
            if (!res.ok || !data.imageUrl) {
                showToast({
                    type: 'error',
                    title: 'Image generation failed',
                    message: data.error || `HTTP ${res.status}`,
                    duration: 7000,
                });
                return;
            }
            onGenerated({ imageUrl: data.imageUrl, prompt: data.prompt || '' });
            showToast({
                type: 'success',
                title: 'Cover image generated',
                message: 'Image attached to the course. Save to persist.',
                duration: 4000,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexpected error';
            showToast({ type: 'error', title: 'Image generation failed', message: msg, duration: 7000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${isDisabled
                ? 'border-[color:var(--ai-card-border)]/40 text-[color:var(--ai-muted)] cursor-not-allowed opacity-60'
                : 'border-[color:var(--ai-primary)]/40 bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 text-[color:var(--ai-primary)] hover:from-[color:var(--ai-primary)]/25 hover:to-[color:var(--ai-secondary)]/25'
                } ${className || ''}`}
            aria-label="Generate course cover image with AI"
            title={!courseId ? 'Save the course first' : 'Generate a 16:9 cover image from the course content'}
        >
            {loading ? (
                <>
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Generating…</span>
                </>
            ) : (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Generate with AI</span>
                </>
            )}
        </button>
    );
};

export default CourseAIImageButton;
