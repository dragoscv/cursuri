'use client'

import React, { useRef, useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string, htmlContent: string) => void;
    placeholder?: string;
    minHeight?: number;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write your answer here...',
    minHeight = 300
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const htmlContent = editorRef.current.innerHTML;
            const textContent = editorRef.current.textContent || '';
            onChange(textContent, htmlContent);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    return (
        <div className="rich-text-editor border border-[color:var(--ai-card-border)] rounded-lg overflow-hidden bg-[color:var(--ai-card-bg)]">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)] font-bold"
                    title="Bold"
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)] italic"
                    title="Italic"
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)] underline"
                    title="Underline"
                >
                    U
                </button>
                <div className="w-px h-6 bg-[color:var(--ai-card-border)] mx-1"></div>
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Bullet List"
                >
                    •
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Numbered List"
                >
                    1.
                </button>
                <div className="w-px h-6 bg-[color:var(--ai-card-border)] mx-1"></div>
                <button
                    type="button"
                    onClick={() => execCommand('justifyLeft')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Align Left"
                >
                    ⬅
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('justifyCenter')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Align Center"
                >
                    ↔
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('justifyRight')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Align Right"
                >
                    ➡
                </button>
                <div className="w-px h-6 bg-[color:var(--ai-card-border)] mx-1"></div>
                <button
                    type="button"
                    onClick={insertLink}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Insert Link"
                >
                    🔗
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('removeFormat')}
                    className="px-3 py-1 rounded hover:bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-foreground)]"
                    title="Clear Formatting"
                >
                    ✕
                </button>
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`p-4 outline-none overflow-auto text-[color:var(--ai-foreground)] ${isFocused ? 'ring-2 ring-[color:var(--ai-primary)]/20' : ''
                    }`}
                style={{ minHeight: `${minHeight}px` }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: var(--ai-muted);
                    pointer-events: none;
                    display: block;
                }
            `}</style>
        </div>
    );
}

export const RichTextEditorSkeleton = () => {
    return (
        <div className="border border-[color:var(--ai-card-border)]/50 rounded-lg flex items-center justify-center p-6 bg-[color:var(--ai-card-bg)]/30 animate-pulse">
            <Spinner size="lg" color="primary" />
        </div>
    );
};