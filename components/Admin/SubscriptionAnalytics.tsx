'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { SectionCard, StatCard, EmptyState } from '@/components/Admin/shell';
import { AppButton, AppModal } from '@/components/shared/ui';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiUsers,
    FiTarget,
    FiCalendar,
    FiAward,
    FiX,
    FiCheck,
    FiArchive,
    FiExternalLink,
} from '@/components/icons/FeatherIcons';

interface PlanBreakdown {
    productId: string;
    productName: string;
    priceId: string;
    interval: string | null;
    unit_amount: number;
    currency: string;
    activeCount: number;
    monthlyValue: number;
}

interface RecentSub {
    id: string;
    status: string;
    customerEmail: string | null;
    customerId: string | null;
    firebaseUserId: string | null;
    productName: string;
    interval: string | null;
    unit_amount: number;
    currency: string;
    created: number;
    current_period_end: number | null;
    cancel_at_period_end: boolean;
}

interface AnalyticsResponse {
    kpis: {
        mrr: number;
        arr: number;
        totalSubscriptions: number;
        activeCount: number;
        trialingCount: number;
        pastDueCount: number;
        canceledCount: number;
        incompleteCount: number;
        cancelAtPeriodEndCount: number;
        createdLast30: number;
        canceledLast30: number;
        churnRate30d: number;
    };
    planBreakdown: PlanBreakdown[];
    signupsByMonth: Record<string, number>;
    cancellationsByMonth: Record<string, number>;
    recent: RecentSub[];
    recentTotal: number;
    recentLimit: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
    active: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    trialing: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    past_due: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    canceled: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    incomplete: 'text-[color:var(--ai-muted)] bg-[color:var(--ai-card-bg)]/60',
    incomplete_expired: 'text-[color:var(--ai-muted)] bg-[color:var(--ai-card-bg)]/60',
    unpaid: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
};

async function fetchAnalytics(recentLimit = 10): Promise<AnalyticsResponse> {
    const token = await firebaseAuth.currentUser?.getIdToken();
    const res = await fetch(
        `/api/admin/subscriptions/analytics?recentLimit=${encodeURIComponent(recentLimit)}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load analytics');
    return data as AnalyticsResponse;
}

type SubAction = 'cancel_at_period_end' | 'cancel_now' | 'resume';

async function patchSubscription(id: string, action: SubAction, reason?: string) {
    const token = await firebaseAuth.currentUser?.getIdToken();
    const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Action failed');
    return data;
}

const SubscriptionAnalytics: React.FC = () => {
    const t = useTranslations('admin.subscriptionAnalytics');
    const locale = useLocale();
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<{
        sub: RecentSub;
        action: SubAction;
    } | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [recentLimit, setRecentLimit] = useState(10);
    const [loadingMore, setLoadingMore] = useState(false);

    const reload = useCallback(async (limit?: number) => {
        setLoading(true);
        setError(null);
        try {
            const d = await fetchAnalytics(limit ?? recentLimit);
            setData(d);
        } catch (e: any) {
            setError(e.message || 'Failed');
        } finally {
            setLoading(false);
        }
    }, [recentLimit]);

    const loadMore = useCallback(async () => {
        if (!data) return;
        const next = Math.min(200, recentLimit + 10);
        if (next === recentLimit) return;
        setLoadingMore(true);
        try {
            const d = await fetchAnalytics(next);
            setRecentLimit(next);
            setData(d);
        } catch (e: any) {
            setError(e.message || 'Failed');
        } finally {
            setLoadingMore(false);
        }
    }, [data, recentLimit]);

    useEffect(() => {
        let mounted = true;
        fetchAnalytics(10)
            .then((d) => {
                if (mounted) setData(d);
            })
            .catch((e: any) => {
                if (mounted) setError(e.message || 'Failed');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const openAction = (sub: RecentSub, action: SubAction) => {
        setPendingAction({ sub, action });
        setActionReason('');
        setActionError(null);
    };

    const closeAction = () => {
        if (actionLoading) return;
        setPendingAction(null);
    };

    const confirmAction = async () => {
        if (!pendingAction) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await patchSubscription(
                pendingAction.sub.id,
                pendingAction.action,
                actionReason || undefined
            );
            setPendingAction(null);
            await reload();
        } catch (e: any) {
            setActionError(e.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const fmtCurrency = (n: number, currency = 'RON') =>
        new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(n);

    const sortedSignups = useMemo(() => {
        if (!data) return [];
        return Object.entries(data.signupsByMonth)
            .map(([k, v]) => {
                const [m, y] = k.split('/').map((n) => parseInt(n, 10));
                return {
                    key: k,
                    month: m,
                    year: y,
                    value: v,
                    label: `${MONTH_LABELS[m - 1]} ${y}`,
                    cancellations: data.cancellationsByMonth[k] || 0,
                };
            })
            .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
    }, [data]);

    const maxBar = useMemo(
        () =>
            sortedSignups.length
                ? Math.max(
                    ...sortedSignups.map((s) => Math.max(s.value, s.cancellations))
                )
                : 0,
        [sortedSignups]
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCard key={i} label="…" value="—" loading />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={<FiTarget size={20} />}
                title={t('errorTitle')}
                description={error}
            />
        );
    }

    if (!data) return null;

    const { kpis } = data;
    const totalActive = kpis.activeCount + kpis.trialingCount;

    return (
        <div className="space-y-6">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('kpis.mrr')}
                    value={fmtCurrency(kpis.mrr)}
                    icon={<FiTrendingUp size={16} />}
                    tone="primary"
                />
                <StatCard
                    label={t('kpis.arr')}
                    value={fmtCurrency(kpis.arr)}
                    icon={<FiAward size={16} />}
                    tone="success"
                />
                <StatCard
                    label={t('kpis.activeSubscribers')}
                    value={totalActive.toLocaleString(locale)}
                    icon={<FiUsers size={16} />}
                />
                <StatCard
                    label={t('kpis.churnRate')}
                    value={`${kpis.churnRate30d.toFixed(1)}%`}
                    icon={kpis.churnRate30d > 0 ? <FiTrendingDown size={16} /> : <FiTrendingUp size={16} />}
                    tone={kpis.churnRate30d <= 5 ? 'success' : 'danger'}
                />
            </div>

            {/* Status breakdown */}
            <SectionCard title={t('status.title')} description={t('status.description')}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatusPill label={t('status.active')} value={kpis.activeCount} status="active" />
                    <StatusPill label={t('status.trialing')} value={kpis.trialingCount} status="trialing" />
                    <StatusPill label={t('status.pastDue')} value={kpis.pastDueCount} status="past_due" />
                    <StatusPill label={t('status.canceled')} value={kpis.canceledCount} status="canceled" />
                    <StatusPill label={t('status.incomplete')} value={kpis.incompleteCount} status="incomplete" />
                    <StatusPill
                        label={t('status.cancelingSoon')}
                        value={kpis.cancelAtPeriodEndCount}
                        status="past_due"
                    />
                </div>
            </SectionCard>

            {/* Signups vs cancellations chart */}
            <SectionCard title={t('cohort.title')} description={t('cohort.description')}>
                {sortedSignups.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-sm text-[color:var(--ai-muted)]">
                        {t('cohort.empty')}
                    </div>
                ) : (
                    <>
                        <div className="h-56 flex items-stretch gap-3">
                            {sortedSignups.map((s, i) => {
                                const upPct = maxBar > 0 ? (s.value / maxBar) * 100 : 0;
                                const downPct = maxBar > 0 ? (s.cancellations / maxBar) * 100 : 0;
                                return (
                                    <div key={s.key} className="flex-1 flex flex-col items-center min-w-0 h-full">
                                        <div className="flex items-end gap-1 w-full flex-1">
                                            <div className="flex-1 flex items-end h-full">
                                                <motion.div
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 120, damping: 18 }}
                                                    style={{ height: `${upPct}%`, transformOrigin: 'bottom' }}
                                                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400"
                                                    title={`+${s.value} signups`}
                                                />
                                            </div>
                                            <div className="flex-1 flex items-end h-full">
                                                <motion.div
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{ delay: i * 0.04 + 0.05, type: 'spring', stiffness: 120, damping: 18 }}
                                                    style={{ height: `${downPct}%`, transformOrigin: 'bottom' }}
                                                    className="w-full rounded-t-md bg-gradient-to-t from-rose-500 to-pink-400"
                                                    title={`-${s.cancellations} canceled`}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[10px] text-[color:var(--ai-muted)] truncate w-full text-center">
                                            {s.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-6 text-xs">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-3 rounded-sm bg-emerald-500" />
                                {t('cohort.signups')}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-3 rounded-sm bg-rose-500" />
                                {t('cohort.cancellations')}
                            </span>
                        </div>
                    </>
                )}
            </SectionCard>

            {/* Plan breakdown */}
            <SectionCard
                title={t('plans.title')}
                description={t('plans.description')}
                flush
            >
                {data.planBreakdown.length === 0 ? (
                    <div className="px-5 py-8">
                        <EmptyState
                            icon={<FiAward size={20} />}
                            title={t('plans.empty')}
                            description=""
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--ai-muted)] border-b border-[color:var(--ai-card-border)]">
                                    <th className="px-5 py-3">{t('plans.plan')}</th>
                                    <th className="px-5 py-3">{t('plans.price')}</th>
                                    <th className="px-5 py-3 text-right">{t('plans.subs')}</th>
                                    <th className="px-5 py-3 text-right">{t('plans.mrrContrib')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[color:var(--ai-card-border)]/60">
                                {data.planBreakdown.map((plan, i) => {
                                    const totalMRR = data.planBreakdown.reduce((s, p) => s + p.monthlyValue, 0);
                                    const share = totalMRR > 0 ? (plan.monthlyValue / totalMRR) * 100 : 0;
                                    return (
                                        <tr key={plan.priceId} className="hover:bg-[color:var(--ai-card-bg)]/40 transition-colors">
                                            <td className="px-5 py-3 font-medium text-[color:var(--ai-foreground)]">
                                                {plan.productName}
                                                {plan.interval && (
                                                    <span className="ml-2 text-[11px] text-[color:var(--ai-muted)]">
                                                        /{plan.interval}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-[color:var(--ai-muted)] tabular-nums">
                                                {fmtCurrency(plan.unit_amount / 100, plan.currency)}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums">{plan.activeCount}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="tabular-nums font-medium text-[color:var(--ai-foreground)]">
                                                        {fmtCurrency(plan.monthlyValue, plan.currency)}
                                                    </span>
                                                    <div className="relative h-1.5 w-20 rounded-full bg-[color:var(--ai-card-border)]/50 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${share}%` }}
                                                            transition={{ duration: 0.6, delay: i * 0.04 }}
                                                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Recent subscriptions */}
            <SectionCard
                title={t('recent.title')}
                description={t('recent.description')}
                flush
            >
                {data.recent.length === 0 ? (
                    <div className="px-5 py-8">
                        <EmptyState
                            icon={<FiCalendar size={20} />}
                            title={t('recent.empty')}
                            description=""
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--ai-muted)] border-b border-[color:var(--ai-card-border)]">
                                    <th className="px-5 py-3">{t('recent.customer')}</th>
                                    <th className="px-5 py-3">{t('recent.plan')}</th>
                                    <th className="px-5 py-3">{t('recent.status')}</th>
                                    <th className="px-5 py-3 text-right">{t('recent.amount')}</th>
                                    <th className="px-5 py-3 text-right">{t('recent.created')}</th>
                                    <th className="px-5 py-3 text-right">{t('recent.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[color:var(--ai-card-border)]/60">
                                {data.recent.map((sub, i) => {
                                    const colorCls = STATUS_COLORS[sub.status] || STATUS_COLORS.incomplete;
                                    const canCancel =
                                        (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') &&
                                        !sub.cancel_at_period_end;
                                    const canResume =
                                        sub.cancel_at_period_end &&
                                        (sub.status === 'active' || sub.status === 'trialing');
                                    const canCancelNow =
                                        sub.status !== 'canceled' &&
                                        sub.status !== 'incomplete_expired';
                                    return (
                                        <motion.tr
                                            key={sub.id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-[color:var(--ai-card-bg)]/40 transition-colors"
                                        >
                                            <td className="px-5 py-3 text-[color:var(--ai-foreground)] truncate max-w-[260px]">
                                                {sub.firebaseUserId ? (
                                                    <Link
                                                        href={`/admin/users/${sub.firebaseUserId}`}
                                                        className="group inline-flex items-center gap-1.5 text-[color:var(--ai-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)]/40 rounded"
                                                        title={t('recent.openUser')}
                                                    >
                                                        <span className="truncate">
                                                            {sub.customerEmail || sub.customerId || sub.id}
                                                        </span>
                                                        <FiExternalLink
                                                            size={11}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                        />
                                                    </Link>
                                                ) : (
                                                    <span className="truncate" title={sub.customerId || ''}>
                                                        {sub.customerEmail || sub.customerId || sub.id}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-[color:var(--ai-foreground)]">
                                                {sub.productName}
                                                {sub.interval && (
                                                    <span className="ml-1 text-xs text-[color:var(--ai-muted)]">
                                                        /{sub.interval}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center px-2 h-6 rounded-full text-[11px] font-medium ${colorCls}`}>
                                                    {sub.status}
                                                </span>
                                                {sub.cancel_at_period_end && (
                                                    <span className="ml-1.5 text-[10px] text-amber-500">⚠ {t('recent.endingSoon')}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums text-[color:var(--ai-foreground)]">
                                                {fmtCurrency(sub.unit_amount / 100, sub.currency)}
                                            </td>
                                            <td className="px-5 py-3 text-right text-xs text-[color:var(--ai-muted)] tabular-nums">
                                                {new Date(sub.created * 1000).toLocaleDateString(locale)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {canResume && (
                                                        <AppButton
                                                            variant="flat"
                                                            color="success"
                                                            size="xs"
                                                            startContent={<FiCheck size={12} />}
                                                            onPress={() => openAction(sub, 'resume')}
                                                        >
                                                            {t('actions.resume')}
                                                        </AppButton>
                                                    )}
                                                    {canCancel && (
                                                        <AppButton
                                                            variant="flat"
                                                            color="warning"
                                                            size="xs"
                                                            startContent={<FiArchive size={12} />}
                                                            onPress={() => openAction(sub, 'cancel_at_period_end')}
                                                        >
                                                            {t('actions.cancelAtEnd')}
                                                        </AppButton>
                                                    )}
                                                    {canCancelNow && (
                                                        <AppButton
                                                            variant="light"
                                                            color="danger"
                                                            size="xs"
                                                            isIconOnly
                                                            onPress={() => openAction(sub, 'cancel_now')}
                                                            title={t('actions.cancelNow')}
                                                        >
                                                            <FiX size={14} />
                                                        </AppButton>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {data.recentTotal > data.recent.length && (
                            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[color:var(--ai-card-border)]/60 text-xs text-[color:var(--ai-muted)]">
                                <span>
                                    Showing{' '}
                                    <span className="text-[color:var(--ai-foreground)] font-medium">
                                        {data.recent.length}
                                    </span>{' '}
                                    of{' '}
                                    <span className="text-[color:var(--ai-foreground)] font-medium">
                                        {data.recentTotal}
                                    </span>
                                </span>
                                <AppButton
                                    size="sm"
                                    variant="secondary"
                                    onPress={loadMore}
                                    isDisabled={loadingMore || recentLimit >= 200}
                                    isLoading={loadingMore}
                                >
                                    {recentLimit >= 200
                                        ? 'Maximum reached'
                                        : `Load more (+${Math.min(10, data.recentTotal - data.recent.length)})`}
                                </AppButton>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>

            {/* Action confirm modal */}
            <AppModal
                isOpen={!!pendingAction}
                onClose={closeAction}
                size="md"
                tone={
                    pendingAction?.action === 'resume'
                        ? 'success'
                        : pendingAction?.action === 'cancel_now'
                            ? 'danger'
                            : 'warning'
                }
                title={
                    pendingAction
                        ? t(`actions.confirm.${pendingAction.action}.title`)
                        : ''
                }
                subtitle={
                    pendingAction?.sub.customerEmail || pendingAction?.sub.id
                }
                icon={
                    pendingAction?.action === 'resume' ? (
                        <FiCheck size={20} />
                    ) : pendingAction?.action === 'cancel_now' ? (
                        <FiX size={20} />
                    ) : (
                        <FiArchive size={20} />
                    )
                }
                footer={
                    <div className="flex items-center gap-2">
                        <AppButton
                            variant="light"
                            onPress={closeAction}
                            isDisabled={actionLoading}
                        >
                            {t('actions.cancel')}
                        </AppButton>
                        <AppButton
                            variant={
                                pendingAction?.action === 'resume'
                                    ? 'success'
                                    : pendingAction?.action === 'cancel_now'
                                        ? 'danger'
                                        : 'primary'
                            }
                            onPress={confirmAction}
                            isLoading={actionLoading}
                            loadingText={t('actions.applying')}
                        >
                            {t('actions.confirmCta')}
                        </AppButton>
                    </div>
                }
            >
                {pendingAction && (
                    <div className="space-y-3">
                        <p className="text-sm text-[color:var(--ai-foreground)]">
                            {t(`actions.confirm.${pendingAction.action}.body`)}
                        </p>
                        {actionError && (
                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                                {actionError}
                            </div>
                        )}
                        <label className="block">
                            <span className="block text-xs font-medium text-[color:var(--ai-muted)] mb-1">
                                {t('actions.reasonLabel')}
                            </span>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                rows={2}
                                placeholder={t('actions.reasonPlaceholder')}
                                className="w-full rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 px-3 py-2 text-sm text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/40 resize-y"
                            />
                        </label>
                    </div>
                )}
            </AppModal>
        </div>
    );
};

const StatusPill: React.FC<{ label: string; value: number; status: string }> = ({
    label,
    value,
    status,
}) => {
    const cls = STATUS_COLORS[status] || STATUS_COLORS.incomplete;
    return (
        <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 px-3 py-2.5">
            <div className={`inline-flex px-2 h-5 items-center rounded-full text-[10px] font-medium ${cls}`}>
                {label}
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[color:var(--ai-foreground)] tabular-nums">
                {value}
            </div>
        </div>
    );
};

export default SubscriptionAnalytics;
