'use client'

import React, { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Chip } from '@heroui/react';
import { motion } from 'framer-motion';

import { AppContext } from '@/components/AppContext';
import {
    PageHeader,
    StatCard,
    SectionCard,
    EmptyState,
    IconSparkles,
    IconBolt,
    IconActivity,
} from '@/components/Admin/shell';
import {
    FiUsers,
    FiBookOpen,
    FiBarChart2,
    FiMail,
    FiSettings,
    FiTrendingUp,
    FiFileText,
    FiCheckCircle,
} from '@/components/icons/FeatherIcons';
import AdminRevenueSection from './AdminRevenueSection';

const formatCurrency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(n || 0);

const formatNumber = (n: number) =>
    new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

interface QuickAction {
    label: string;
    href: string;
    icon: React.ReactNode;
    description: string;
    tone: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Add new course',
        href: '/admin/courses/add',
        icon: <FiBookOpen size={18} />,
        description: 'Publish a new course',
        tone: 'from-indigo-500/15 to-violet-500/10',
    },
    {
        label: 'Manage users',
        href: '/admin/users',
        icon: <FiUsers size={18} />,
        description: 'Roles & enrollments',
        tone: 'from-sky-500/15 to-cyan-500/10',
    },
    {
        label: 'Inbox',
        href: '/admin/messages',
        icon: <FiMail size={18} />,
        description: 'Read contact messages',
        tone: 'from-emerald-500/15 to-teal-500/10',
    },
    {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: <FiBarChart2 size={18} />,
        description: 'Platform performance',
        tone: 'from-amber-500/15 to-orange-500/10',
    },
    {
        label: 'Audit log',
        href: '/admin/audit',
        icon: <FiFileText size={18} />,
        description: 'Security & changes',
        tone: 'from-rose-500/15 to-pink-500/10',
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: <FiSettings size={18} />,
        description: 'Configure the platform',
        tone: 'from-slate-500/15 to-zinc-500/10',
    },
];

interface AuditEntry {
    id: string;
    action?: string;
    category?: string;
    severity?: 'info' | 'warning' | 'error' | string;
    timestamp?: number | string;
    user?: { email?: string; displayName?: string } | string;
    status?: string;
}

const severityChip: Record<string, { color: 'default' | 'primary' | 'warning' | 'danger' | 'success'; label: string }> = {
    info: { color: 'primary', label: 'Info' },
    warning: { color: 'warning', label: 'Warning' },
    error: { color: 'danger', label: 'Error' },
    success: { color: 'success', label: 'OK' },
};

const formatRelativeTime = (input?: number | string) => {
    if (!input) return '';
    const t = new Date(input).getTime();
    if (Number.isNaN(t)) return '';
    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
};

const AdminDashboard: React.FC = () => {
    const t = useTranslations('admin.dashboard');
    const tCommon = useTranslations('common');
    const ctx = useContext(AppContext);

    if (!ctx) throw new Error('AdminDashboard must be used within AppProvider');

    const { adminAnalytics, getAdminAnalytics, user } = ctx;

    const [loading, setLoading] = useState<boolean>(!adminAnalytics);
    const [error, setError] = useState<string | null>(null);
    const [recent, setRecent] = useState<AuditEntry[]>([]);
    const [recentLoading, setRecentLoading] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;
        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                if (getAdminAnalytics && mounted) await getAdminAnalytics();
            } catch (e) {
                console.error('Error fetching analytics:', e);
                if (mounted) setError(t('failedToLoad'));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        if (!adminAnalytics) fetchAnalytics();
        else setLoading(false);
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminAnalytics]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = await user?.getIdToken?.();
                const res = await fetch('/api/admin/audit-logs?timeRange=24h', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error(`status ${res.status}`);
                const data = await res.json();
                const entries: AuditEntry[] = (data?.logs ?? data?.items ?? data ?? []).slice(0, 6);
                if (mounted) setRecent(entries);
            } catch {
                if (mounted) setRecent([]);
            } finally {
                if (mounted) setRecentLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [user]);

    const monthlyTrend = useMemo(() => {
        const months = adminAnalytics?.monthlyRevenue ? Object.values(adminAnalytics.monthlyRevenue) : [];
        if (months.length < 2) return 0;
        const last = months[months.length - 1] ?? 0;
        const prev = months[months.length - 2] ?? 0;
        if (!prev) return last > 0 ? 100 : 0;
        return ((last - prev) / prev) * 100;
    }, [adminAnalytics]);

    const newUsersTrend = useMemo(() => {
        const total = adminAnalytics?.totalUsers ?? 0;
        const fresh = adminAnalytics?.newUsers ?? 0;
        if (!total) return 0;
        return (fresh / total) * 100;
    }, [adminAnalytics]);

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Welcome back"
                title={t('title')}
                description={t('overview')}
                icon={<IconSparkles size={20} />}
                actions={
                    <>
                        <Button
                            as={Link}
                            href="/admin/analytics"
                            variant="flat"
                            size="sm"
                            startContent={<FiBarChart2 size={16} />}
                        >
                            View analytics
                        </Button>
                        <Button
                            as={Link}
                            href="/admin/courses/add"
                            size="sm"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-md"
                            startContent={<IconBolt size={14} />}
                        >
                            New course
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Total revenue"
                    value={formatCurrency(adminAnalytics?.totalRevenue ?? 0)}
                    hint={`${adminAnalytics?.newSales ?? 0} sales last 30d`}
                    trend={Number.isFinite(monthlyTrend) ? monthlyTrend : undefined}
                    tone="success"
                    icon={<FiTrendingUp size={18} />}
                    loading={loading}
                />
                <StatCard
                    label="Total users"
                    value={formatNumber(adminAnalytics?.totalUsers ?? 0)}
                    hint={`${adminAnalytics?.newUsers ?? 0} new in 30d`}
                    trend={newUsersTrend}
                    tone="primary"
                    icon={<FiUsers size={18} />}
                    loading={loading}
                />
                <StatCard
                    label="Active courses"
                    value={formatNumber(adminAnalytics?.totalCourses ?? 0)}
                    hint={`${adminAnalytics?.totalLessons ?? 0} lessons`}
                    tone="warning"
                    icon={<FiBookOpen size={18} />}
                    loading={loading}
                />
                <StatCard
                    label="Average per sale"
                    value={formatCurrency(
                        (adminAnalytics?.newSales ?? 0) > 0
                            ? (adminAnalytics?.totalRevenue ?? 0) / (adminAnalytics?.newSales ?? 1)
                            : 0
                    )}
                    hint="Last 30 days"
                    tone="neutral"
                    icon={<FiCheckCircle size={18} />}
                    loading={loading}
                />
            </div>

            <SectionCard
                title="Quick actions"
                description="Jump straight into the most common tasks"
                actions={
                    <Chip size="sm" variant="flat" startContent={<IconBolt size={12} />}>
                        Press ⌘K
                    </Chip>
                }
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {QUICK_ACTIONS.map((qa, i) => (
                        <motion.div
                            key={qa.href}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <Link
                                href={qa.href}
                                className={[
                                    'group relative flex flex-col gap-2 p-4 rounded-xl border border-[color:var(--ai-card-border)]',
                                    'bg-gradient-to-br',
                                    qa.tone,
                                    'hover:border-[color:var(--ai-primary)]/40 hover:shadow-md hover:-translate-y-0.5 transition',
                                ].join(' ')}
                            >
                                <span className="h-9 w-9 grid place-items-center rounded-lg bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] text-[color:var(--ai-primary)] group-hover:scale-105 transition-transform">
                                    {qa.icon}
                                </span>
                                <div className="text-sm font-semibold text-[color:var(--ai-foreground)] leading-tight">
                                    {qa.label}
                                </div>
                                <div className="text-[11px] text-[color:var(--ai-muted)] leading-snug">{qa.description}</div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <SectionCard
                        title="Popular courses"
                        description="Top performing courses by enrollment"
                        actions={
                            <Button as={Link} href="/admin/courses" size="sm" variant="light">
                                View all
                            </Button>
                        }
                    >
                        {!adminAnalytics?.popularCourses?.length ? (
                            <EmptyState
                                icon={<FiBookOpen size={22} />}
                                title="No enrollment data yet"
                                description="Once students enroll, your top performing courses will appear here."
                            />
                        ) : (
                            <ul className="divide-y divide-[color:var(--ai-card-border)]">
                                {adminAnalytics.popularCourses.slice(0, 6).map((course, i) => {
                                    const max = adminAnalytics.popularCourses[0]?.enrollments || 1;
                                    const pct = Math.max(6, Math.round((course.enrollments / max) * 100));
                                    return (
                                        <motion.li
                                            key={course.courseId}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="py-3 flex items-center gap-4"
                                        >
                                            <div
                                                className={[
                                                    'h-9 w-9 grid place-items-center rounded-lg text-sm font-semibold',
                                                    i === 0
                                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                                                        : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]',
                                                ].join(' ')}
                                            >
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-[color:var(--ai-foreground)] truncate">
                                                    {course.courseName}
                                                </div>
                                                <div className="mt-1.5 h-1.5 rounded-full bg-[color:var(--ai-card-border)]/50 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.05 }}
                                                        className="h-full rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-semibold text-[color:var(--ai-foreground)]">
                                                    {course.enrollments}
                                                </div>
                                                <div className="text-[11px] text-[color:var(--ai-muted)]">enrollments</div>
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        )}
                    </SectionCard>
                </div>

                <SectionCard
                    title="Recent activity"
                    description="Latest admin & system events"
                    actions={
                        <Button as={Link} href="/admin/audit" size="sm" variant="light">
                            Open log
                        </Button>
                    }
                >
                    {recentLoading ? (
                        <ul className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-[color:var(--ai-card-border)]/50 animate-pulse" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-3/4 rounded bg-[color:var(--ai-card-border)]/60 animate-pulse" />
                                        <div className="h-2.5 w-1/2 rounded bg-[color:var(--ai-card-border)]/40 animate-pulse" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : recent.length === 0 ? (
                        <EmptyState
                            icon={<IconActivity size={22} />}
                            title="No recent activity"
                            description="Admin actions in the last 24h will show up here."
                        />
                    ) : (
                        <ul className="space-y-1">
                            {recent.map((entry, i) => {
                                const sevKey = (entry.severity ?? 'info').toString().toLowerCase();
                                const chip = severityChip[sevKey] ?? severityChip.info;
                                const userLabel =
                                    typeof entry.user === 'string'
                                        ? entry.user
                                        : entry.user?.displayName || entry.user?.email || 'system';
                                return (
                                    <motion.li
                                        key={entry.id ?? i}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="flex items-start gap-3 py-2 border-b border-[color:var(--ai-card-border)]/60 last:border-0"
                                    >
                                        <div className="h-8 w-8 grid place-items-center rounded-lg bg-[color:var(--ai-primary)]/8 text-[color:var(--ai-primary)] shrink-0">
                                            <IconActivity size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-[color:var(--ai-foreground)] truncate">
                                                {entry.action ?? entry.category ?? 'event'}
                                            </div>
                                            <div className="text-[11px] text-[color:var(--ai-muted)] truncate">
                                                {userLabel} · {formatRelativeTime(entry.timestamp)}
                                            </div>
                                        </div>
                                        <Chip size="sm" variant="flat" color={chip.color} className="h-5 text-[10px]">
                                            {chip.label}
                                        </Chip>
                                    </motion.li>
                                );
                            })}
                        </ul>
                    )}
                </SectionCard>
            </div>

            <SectionCard title="Revenue over time" description="Monthly revenue trend">
                <AdminRevenueSection analytics={adminAnalytics ?? null} />
            </SectionCard>

            {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                    {error} — {tCommon('pleaseTryAgain')}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
