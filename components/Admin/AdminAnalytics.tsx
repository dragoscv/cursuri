'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AppContext } from '@/components/AppContext';
import { SectionCard, StatCard, EmptyState } from '@/components/Admin/shell';
import {
    FiBookOpen,
    FiUsers,
    FiTarget,
    FiCalendar,
    FiBook,
    FiAward,
} from '@/components/icons/FeatherIcons';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminAnalytics: React.FC = () => {
    const t = useTranslations('admin.analytics');
    const locale = useLocale();
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('AdminAnalytics must be used within an AppProvider');
    }

    const { adminAnalytics, getAdminAnalytics } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                if (getAdminAnalytics && mounted) {
                    await getAdminAnalytics();
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
                if (mounted) setError('Failed to load analytics data');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (!adminAnalytics) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }

        return () => {
            mounted = false;
        };
    }, [getAdminAnalytics, adminAnalytics]);

    const sortedMonthlyRevenue = useMemo(() => {
        if (!adminAnalytics?.monthlyRevenue) return [];
        return Object.entries(adminAnalytics.monthlyRevenue)
            .map(([monthYear, amount]) => {
                const [month, year] = monthYear.split('/').map((n) => parseInt(n, 10));
                return {
                    monthYear,
                    month,
                    year,
                    amount,
                    label: `${MONTH_LABELS[month - 1]} ${year}`,
                };
            })
            .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
    }, [adminAnalytics?.monthlyRevenue]);

    const maxRevenue = useMemo(
        () => (sortedMonthlyRevenue.length ? Math.max(...sortedMonthlyRevenue.map((r) => r.amount)) : 0),
        [sortedMonthlyRevenue]
    );

    const totalSales =
        adminAnalytics?.popularCourses?.reduce((sum, c) => sum + c.enrollments, 0) || 0;

    const revenueGrowth = useMemo(() => {
        if (sortedMonthlyRevenue.length < 2) return 0;
        const cur = sortedMonthlyRevenue[sortedMonthlyRevenue.length - 1];
        const prev = sortedMonthlyRevenue[sortedMonthlyRevenue.length - 2];
        if (prev.amount <= 0) return 0;
        return ((cur.amount - prev.amount) / prev.amount) * 100;
    }, [sortedMonthlyRevenue]);

    const fmtCurrency = (n: number, opts?: Intl.NumberFormatOptions) =>
        n.toLocaleString(locale, { style: 'currency', currency: 'RON', ...opts });

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCard key={i} label="Loading…" value="—" loading />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={<FiTarget size={20} />}
                title={error}
                description={t('pleaseTryAgain')}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('totalRevenue')}
                    value={fmtCurrency(adminAnalytics?.totalRevenue || 0)}
                    icon={<FiAward size={16} />}
                    tone="primary"
                />
                <StatCard
                    label={t('averagePerSale')}
                    value={
                        adminAnalytics && adminAnalytics.totalRevenue && totalSales > 0
                            ? fmtCurrency(adminAnalytics.totalRevenue / totalSales, { maximumFractionDigits: 0 })
                            : '0 RON'
                    }
                    icon={<FiTarget size={16} />}
                />
                <StatCard
                    label={t('salesLast30Days')}
                    value={adminAnalytics?.newSales || 0}
                    icon={<FiCalendar size={16} />}
                    tone="success"
                />
                <StatCard
                    label={t('revenueGrowth')}
                    value={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
                    tone={revenueGrowth >= 0 ? 'success' : 'danger'}
                    trend={revenueGrowth}
                />
            </div>

            {/* Revenue chart */}
            <SectionCard
                title={t('revenueOverTime')}
                description="Monthly revenue trend across the platform."
            >
                {sortedMonthlyRevenue.length > 0 ? (
                    <div className="h-64 flex items-end gap-2">
                        {sortedMonthlyRevenue.map((item, i) => {
                            const heightPct = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;
                            return (
                                <div
                                    key={item.monthYear}
                                    className="flex flex-col items-center flex-1 min-w-0 group"
                                    title={fmtCurrency(item.amount)}
                                >
                                    <div className="w-full h-full flex items-end">
                                        <motion.div
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 120, damping: 18 }}
                                            style={{ height: `${heightPct}%`, transformOrigin: 'bottom' }}
                                            className="w-full rounded-t-lg bg-gradient-to-t from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] group-hover:opacity-90 transition-opacity"
                                        />
                                    </div>
                                    <div className="mt-2 text-[10px] text-[color:var(--ai-muted)] truncate w-full text-center">
                                        {item.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-sm text-[color:var(--ai-muted)]">
                        {t('noRevenueData')}
                    </div>
                )}
            </SectionCard>

            {/* User growth + Course statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title={t('userGrowth')}>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="text-4xl font-bold text-[color:var(--ai-foreground)]">
                            {(adminAnalytics?.totalUsers || 0).toLocaleString(locale)}
                        </div>
                        <p className="mt-1 text-sm text-[color:var(--ai-muted)]">{t('totalUsers')}</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)] text-xs font-medium">
                            <FiUsers size={12} />
                            +{adminAnalytics?.newUsers || 0} new in 30d
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title={t('courseStatistics')}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 p-4 text-center">
                            <FiBookOpen className="mx-auto text-[color:var(--ai-primary)]" size={18} />
                            <div className="mt-2 text-2xl font-bold text-[color:var(--ai-foreground)]">
                                {adminAnalytics?.totalCourses || 0}
                            </div>
                            <p className="text-xs text-[color:var(--ai-muted)] mt-1">{t('activeCourses')}</p>
                        </div>
                        <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 p-4 text-center">
                            <FiBook className="mx-auto text-[color:var(--ai-secondary)]" size={18} />
                            <div className="mt-2 text-2xl font-bold text-[color:var(--ai-foreground)]">
                                {adminAnalytics?.totalLessons || 0}
                            </div>
                            <p className="text-xs text-[color:var(--ai-muted)] mt-1">{t('totalLessons')}</p>
                        </div>
                        <div className="col-span-2 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 p-4 text-center">
                            <div className="text-2xl font-bold text-[color:var(--ai-foreground)]">
                                {adminAnalytics && adminAnalytics.totalCourses > 0
                                    ? (adminAnalytics.totalLessons / adminAnalytics.totalCourses).toFixed(1)
                                    : 0}
                            </div>
                            <p className="text-xs text-[color:var(--ai-muted)] mt-1">Avg. lessons per course</p>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Popular courses */}
            <SectionCard
                title={t('popularCourses')}
                description="Top courses ranked by total enrollments."
                flush
            >
                {adminAnalytics?.popularCourses && adminAnalytics.popularCourses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--ai-muted)] border-b border-[color:var(--ai-card-border)]">
                                    <th className="px-5 py-3 w-12">#</th>
                                    <th className="px-5 py-3">Course</th>
                                    <th className="px-5 py-3 w-32">Enrollments</th>
                                    <th className="px-5 py-3 w-48">Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[color:var(--ai-card-border)]/60">
                                {adminAnalytics.popularCourses.map((course, index) => {
                                    const totalEnrollments = adminAnalytics.popularCourses.reduce(
                                        (sum, c) => sum + c.enrollments,
                                        0
                                    );
                                    const percentage =
                                        totalEnrollments > 0 ? (course.enrollments / totalEnrollments) * 100 : 0;
                                    return (
                                        <motion.tr
                                            key={course.courseId}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-[color:var(--ai-card-bg)]/40 transition-colors"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 text-[color:var(--ai-primary)]">
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 font-medium text-[color:var(--ai-foreground)]">
                                                {course.courseName}
                                            </td>
                                            <td className="px-5 py-3 text-[color:var(--ai-muted)]">
                                                {course.enrollments}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative h-1.5 flex-1 rounded-full bg-[color:var(--ai-card-border)]/50 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 0.6, delay: index * 0.04 }}
                                                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-[color:var(--ai-muted)] tabular-nums w-10 text-right">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-5 py-8">
                        <EmptyState
                            icon={<FiBookOpen size={20} />}
                            title="No enrollment data"
                            description="Course enrollments will appear here once available."
                        />
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default AdminAnalytics;
