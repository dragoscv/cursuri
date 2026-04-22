'use client';

/**
 * CourseAIFillButton — magic-wand button for COURSE-level form fields.
 *
 * Posts to /api/admin/courses/ai-generate-field which collects every lesson
 * of the course (transcripts + summaries + key points) and asks Azure OpenAI
 * to draft the requested field.
 *
 * For list fields (objectives / requirements / tags / categories / keywords /
 * badges) `onFill` receives `string[]`. For scalar fields (name, description)
 * it receives a single `string`.
 */

import React, { useState } from 'react';
import { Tooltip } from '@heroui/react';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { useToast } from '@/components/Toast/ToastContext';

export type CourseAIFillField =
    | 'name'
    | 'description'
    | 'objectives'
    | 'requirements'
    | 'tags'
    | 'categories'
    | 'keywords'
    | 'badges';

interface Props {
    courseId?: string;
    field: CourseAIFillField;
    /** Current draft value (joined for list fields). */
    currentValue?: string;
    /** Disable when no lessons exist yet. */
    disabled?: boolean;
    /** Override the default tooltip label. */
    label?: string;
    /** Receive the generated value. */
    onFill: (value: string | string[]) => void;
    /** Visual style. */
    variant?: 'inline' | 'badge';
}

const Wand: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
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
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8 19 13" />
        <path d="M15 9h.01" />
        <path d="M17.8 6.2 19 5" />
        <path d="m3 21 9-9" />
        <path d="M12.2 6.2 11 5" />
    </svg>
);

const Spinner: React.FC<{ size?: number }> = ({ size = 14 }) => (
    <span
        className="inline-block rounded-full border-2 border-current border-t-transparent animate-spin"
        style={{ width: size, height: size }}
        aria-hidden="true"
    />
);

const FIELD_LABELS: Record<CourseAIFillField, string> = {
    name: 'Generate course name with AI',
    description: 'Generate course description with AI',
    objectives: 'Generate learning outcomes with AI',
    requirements: 'Generate prerequisites with AI',
    tags: 'Generate tags with AI',
    categories: 'Generate categories with AI',
    keywords: 'Generate SEO keywords with AI',
    badges: 'Generate marketing badges with AI',
};

const CourseAIFillButton: React.FC<Props> = ({
    courseId,
    field,
    currentValue,
    disabled,
    label,
    onFill,
    variant = 'inline',
}) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const tooltip = label || FIELD_LABELS[field];
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
            const res = await fetch('/api/admin/courses/ai-generate-field', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ courseId, field, currentValue }),
            });
            const data = (await res.json().catch(() => ({}))) as { value?: string; values?: string[]; error?: string };
            if (!res.ok) {
                showToast({ type: 'error', title: 'AI fill failed', message: data.error || `HTTP ${res.status}`, duration: 6000 });
                return;
            }
            if (Array.isArray(data.values)) {
                if (data.values.length === 0) {
                    showToast({ type: 'warning', title: 'No suggestions', message: 'The model returned an empty list.' });
                    return;
                }
                onFill(data.values);
            } else if (typeof data.value === 'string' && data.value.length > 0) {
                onFill(data.value);
            } else {
                showToast({ type: 'warning', title: 'Empty response', message: 'The model returned no usable value.' });
                return;
            }
            showToast({ type: 'success', title: 'AI filled', message: 'Field populated. Edit before saving.', duration: 3000 });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexpected error';
            showToast({ type: 'error', title: 'AI fill failed', message: msg, duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    const baseClass =
        variant === 'badge'
            ? 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition'
            : 'inline-flex items-center justify-center h-7 w-7 rounded-md transition';
    const enabledClass =
        variant === 'badge'
            ? 'border-[color:var(--ai-primary)]/30 bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 text-[color:var(--ai-primary)] hover:from-[color:var(--ai-primary)]/20 hover:to-[color:var(--ai-secondary)]/20'
            : 'text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/10';
    const disabledClass = 'opacity-40 cursor-not-allowed';

    return (
        <Tooltip
            content={!courseId ? 'Save the course first' : disabled ? 'Add at least one lesson with AI assets first' : tooltip}
            placement="top"
        >
            <button
                type="button"
                onClick={handleClick}
                disabled={isDisabled}
                className={`${baseClass} ${isDisabled ? disabledClass : enabledClass}`}
                aria-label={tooltip}
            >
                {loading ? <Spinner /> : <Wand />}
                {variant === 'badge' && <span>{loading ? 'Generating…' : 'AI fill'}</span>}
            </button>
        </Tooltip>
    );
};

export default CourseAIFillButton;
