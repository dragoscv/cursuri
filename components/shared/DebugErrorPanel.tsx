'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export interface DebugErrorPanelProps {
    error: Error & { digest?: string };
    reset?: () => void;
    /** Short heading shown above the error message. */
    title?: string;
    /** Where the error happened (e.g. "Admin · Audit logs"). Stamped into the report. */
    scope?: string;
    /** Hide the home button (e.g. inside global-error where router is unavailable). */
    hideHome?: boolean;
}

interface DebugReport {
    timestamp: string;
    scope: string;
    url: string;
    pathname: string;
    userAgent: string;
    locale: string;
    viewport: string;
    name: string;
    message: string;
    digest: string | null;
    stack: string | null;
    cause: string | null;
    sentryEventId: string | null;
}

function buildReport(
    error: DebugErrorPanelProps['error'],
    scope: string,
    sentryEventId: string | null
): DebugReport {
    const isBrowser = typeof window !== 'undefined';
    return {
        timestamp: new Date().toISOString(),
        scope,
        url: isBrowser ? window.location.href : 'n/a',
        pathname: isBrowser ? window.location.pathname : 'n/a',
        userAgent: isBrowser ? navigator.userAgent : 'n/a',
        locale: isBrowser ? navigator.language : 'n/a',
        viewport: isBrowser ? `${window.innerWidth}x${window.innerHeight}` : 'n/a',
        name: error.name || 'Error',
        message: error.message || 'Unknown error',
        digest: error.digest || null,
        stack: error.stack || null,
        cause:
            error.cause === undefined || error.cause === null
                ? null
                : typeof error.cause === 'string'
                    ? error.cause
                    : (() => {
                        try {
                            return JSON.stringify(error.cause, null, 2);
                        } catch {
                            return String(error.cause);
                        }
                    })(),
        sentryEventId,
    };
}

function reportToMarkdown(r: DebugReport): string {
    return [
        '## Error report',
        '',
        `- **When:** \`${r.timestamp}\``,
        `- **Where:** ${r.scope}`,
        `- **URL:** \`${r.url}\``,
        `- **Locale:** \`${r.locale}\``,
        `- **Viewport:** \`${r.viewport}\``,
        `- **User-Agent:** \`${r.userAgent}\``,
        r.digest ? `- **Next.js digest:** \`${r.digest}\`` : null,
        r.sentryEventId ? `- **Sentry event:** \`${r.sentryEventId}\`` : null,
        '',
        '### Error',
        '',
        '```',
        `${r.name}: ${r.message}`,
        '```',
        r.stack
            ? ['', '### Stack', '', '```', r.stack, '```'].join('\n')
            : null,
        r.cause
            ? ['', '### Cause', '', '```', r.cause, '```'].join('\n')
            : null,
    ]
        .filter(Boolean)
        .join('\n');
}

const DebugErrorPanel: React.FC<DebugErrorPanelProps> = ({
    error,
    reset,
    title = 'Something went wrong',
    scope = 'app',
    hideHome = false,
}) => {
    const [sentryEventId, setSentryEventId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showStack, setShowStack] = useState(false);

    // Capture to Sentry once (and grab the event id so we can show + copy it).
    useEffect(() => {
        try {
            const id = Sentry.captureException(error, {
                tags: { scope },
                extra: {
                    digest: error.digest,
                    url: typeof window !== 'undefined' ? window.location.href : null,
                },
            });
            if (id) setSentryEventId(id);
        } catch {
            // Sentry not initialized or DSN missing — don't crash the error page.
        }
    }, [error, scope]);

    const report = useMemo(
        () => buildReport(error, scope, sentryEventId),
        [error, scope, sentryEventId]
    );
    const markdown = useMemo(() => reportToMarkdown(report), [report]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdown);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: select + execCommand
            const ta = document.createElement('textarea');
            ta.value = markdown;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
            } finally {
                document.body.removeChild(ta);
            }
        }
    };

    return (
        <div className="min-h-[60vh] w-full px-4 py-12 flex items-start justify-center bg-[rgb(var(--background-start-rgb))]">
            <div className="w-full max-w-3xl">
                {/* Heading */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-[color:var(--ai-foreground)]">{title}</h1>
                        <p className="mt-1 text-sm text-[color:var(--ai-muted)]">
                            An unexpected error stopped this page from rendering. Copy the report below and share it
                            with the team — it has everything needed to reproduce and fix.
                        </p>
                    </div>
                </div>

                {/* Error summary card */}
                <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 backdrop-blur-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[color:var(--ai-card-border)] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="inline-flex items-center px-2 h-5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
                                {report.name}
                            </span>
                            <span className="text-sm text-[color:var(--ai-muted)] truncate">{scope}</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-colors ${copied
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Copied
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    Copy debug report
                                </>
                            )}
                        </button>
                    </div>

                    <div className="px-5 py-4">
                        <p className="text-sm text-[color:var(--ai-foreground)] font-mono break-words">
                            {report.message}
                        </p>
                    </div>

                    {/* Metadata grid */}
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 border-t border-[color:var(--ai-card-border)] text-xs">
                        <Row label="When" value={report.timestamp} mono />
                        <Row label="URL" value={report.url} mono />
                        {report.digest && <Row label="Next.js digest" value={report.digest} mono />}
                        {report.sentryEventId && (
                            <Row label="Sentry event" value={report.sentryEventId} mono />
                        )}
                        <Row label="Viewport" value={report.viewport} mono />
                        <Row label="Locale" value={report.locale} mono />
                        <Row label="User-Agent" value={report.userAgent} mono className="sm:col-span-2" />
                    </dl>

                    {/* Stack trace */}
                    {report.stack && (
                        <div className="border-t border-[color:var(--ai-card-border)]">
                            <button
                                type="button"
                                onClick={() => setShowStack((v) => !v)}
                                className="w-full px-5 py-3 flex items-center justify-between text-xs font-medium text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] transition-colors"
                            >
                                <span>{showStack ? 'Hide' : 'Show'} stack trace</span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform ${showStack ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {showStack && (
                                <pre className="px-5 pb-4 text-[11px] text-[color:var(--ai-muted)] font-mono whitespace-pre-wrap break-words max-h-80 overflow-auto">
                                    {report.stack}
                                </pre>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    {reset && (
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-[color:var(--ai-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Try again
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() =>
                            typeof window !== 'undefined' && window.location.reload()
                        }
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-[color:var(--ai-card-border)] text-sm font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/60 transition-colors"
                    >
                        Reload page
                    </button>
                    {!hideHome && (
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-[color:var(--ai-card-border)] text-sm font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/60 transition-colors"
                        >
                            Go home
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean; className?: string }> = ({
    label,
    value,
    mono,
    className = '',
}) => (
    <div className={`flex flex-col gap-0.5 min-w-0 ${className}`}>
        <dt className="text-[10px] uppercase tracking-wider text-[color:var(--ai-muted)]">{label}</dt>
        <dd
            className={`text-[color:var(--ai-foreground)] truncate ${mono ? 'font-mono text-[11px]' : ''}`}
            title={value}
        >
            {value}
        </dd>
    </div>
);

export default DebugErrorPanel;
