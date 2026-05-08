'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Spinner, Chip, Select } from '@heroui/react';
import SelectItem from '@/components/ui/SelectItem';
import { firebaseAuth } from '@/utils/firebase/firebase.config';

interface TimelineEntry {
    id: string;
    timestamp: string;
    source: 'audit' | 'activity';
    type: string;
    category?: string;
    severity?: string;
    success?: boolean;
    actorRole?: string;
    actorId?: string;
    actorEmail?: string;
    ipAddress?: string;
    details?: Record<string, unknown>;
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All categories' },
    { value: 'authentication', label: 'Authentication' },
    { value: 'admin_action', label: 'Admin actions' },
    { value: 'user_management', label: 'User management' },
    { value: 'payment', label: 'Payment' },
    { value: 'security', label: 'Security' },
    { value: 'course_management', label: 'Course' },
    { value: 'data_modification', label: 'Data' },
    { value: 'api_access', label: 'API' },
];

function severityColor(s?: string): 'default' | 'success' | 'warning' | 'danger' {
    if (s === 'critical') return 'danger';
    if (s === 'warning') return 'warning';
    if (s === 'info') return 'success';
    return 'default';
}

function relTime(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
}

interface Props {
    userId: string;
}

export default function UserActivityTimeline({ userId }: Props) {
    const [entries, setEntries] = useState<TimelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<string>('all');
    const [counts, setCounts] = useState<{ audit: number; activity: number; total: number } | null>(
        null
    );

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const token = await firebaseAuth.currentUser?.getIdToken();
                const url = `/api/admin/users/${userId}/activity?limit=200${
                    category !== 'all' ? `&category=${category}` : ''
                }`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.success) {
                    setError(data.error || 'Failed to load activity');
                    setEntries([]);
                } else {
                    setEntries(data.entries || []);
                    setCounts(data.counts || null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Network error');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [userId, category]);

    const grouped = useMemo(() => {
        const buckets = new Map<string, TimelineEntry[]>();
        for (const e of entries) {
            const day = (e.timestamp || '').slice(0, 10) || 'Unknown';
            const arr = buckets.get(day) || [];
            arr.push(e);
            buckets.set(day, arr);
        }
        return Array.from(buckets.entries());
    }, [entries]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-[color:var(--ai-muted-foreground)]">
                        Unified timeline of audit-logged actions and tracked activity.
                    </p>
                    {counts && (
                        <Chip size="sm" variant="flat">
                            {counts.audit} audit · {counts.activity} activity
                        </Chip>
                    )}
                </div>
                <div className="w-full sm:w-64">
                    <Select
                        size="sm"
                        selectedKeys={[category]}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setCategory(e.target.value || 'all')
                        }
                        aria-label="Filter by category"
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} textValue={opt.label}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <Spinner size="md" color="primary" />
                </div>
            )}
            {error && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {!loading && !error && entries.length === 0 && (
                <div className="text-center py-12 text-[color:var(--ai-muted-foreground)]">
                    <p className="text-2xl mb-2">📭</p>
                    <p>No tracked activity yet.</p>
                </div>
            )}

            {!loading && !error && grouped.length > 0 && (
                <div className="space-y-6">
                    {grouped.map(([day, list]) => (
                        <div key={day}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ai-muted-foreground)] mb-2">
                                {day}
                            </p>
                            <ul className="space-y-2">
                                {list.map((e) => (
                                    <li
                                        key={e.id}
                                        className="p-3 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-sm break-all">
                                                {e.type}
                                            </span>
                                            {e.category && (
                                                <Chip size="sm" variant="flat" color="default">
                                                    {e.category}
                                                </Chip>
                                            )}
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={severityColor(e.severity)}
                                            >
                                                {e.source === 'audit'
                                                    ? e.severity || 'info'
                                                    : 'activity'}
                                            </Chip>
                                            {e.success === false && (
                                                <Chip size="sm" variant="flat" color="danger">
                                                    failed
                                                </Chip>
                                            )}
                                            <span className="ml-auto text-xs text-[color:var(--ai-muted-foreground)]">
                                                {relTime(e.timestamp)}
                                            </span>
                                        </div>
                                        {(e.actorEmail || e.ipAddress) && (
                                            <div className="mt-1 text-xs text-[color:var(--ai-muted-foreground)] flex flex-wrap gap-x-3 gap-y-1">
                                                {e.actorEmail && <span>by {e.actorEmail}</span>}
                                                {e.actorRole && (
                                                    <span>role: {e.actorRole}</span>
                                                )}
                                                {e.ipAddress && (
                                                    <span className="font-mono">
                                                        ip: {e.ipAddress}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {e.details && Object.keys(e.details).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-xs text-[color:var(--ai-muted-foreground)] hover:text-[color:var(--ai-foreground)]">
                                                    Details
                                                </summary>
                                                <pre className="mt-2 text-xs whitespace-pre-wrap break-all bg-black/5 dark:bg-white/5 rounded-md p-2">
                                                    {JSON.stringify(e.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
