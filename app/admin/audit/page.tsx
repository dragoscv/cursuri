'use client';

import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import type { AppContextProps } from '@/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Chip, Button, Select, SelectItem } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageHeader,
  IconShield,
  IconActivity,
  StatCard,
  SectionCard,
  EmptyState,
  DataToolbar,
} from '@/components/Admin/shell';
import { FiDownload, FiX, FiCheckCircle } from '@/components/icons/FeatherIcons';

interface AuditLog {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  severity: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

interface AuditStatistics {
  totalLogs: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  failedActions: number;
  topUsers: Array<{ userId: string; count: number }>;
}

const CATEGORY_OPTIONS = [
  { key: 'all', label: 'All categories' },
  { key: 'authentication', label: 'Authentication' },
  { key: 'admin_action', label: 'Admin Actions' },
  { key: 'course_management', label: 'Course Management' },
  { key: 'user_management', label: 'User Management' },
  { key: 'payment', label: 'Payment' },
  { key: 'security', label: 'Security' },
];

const SEVERITY_OPTIONS = [
  { key: 'all', label: 'All severities' },
  { key: 'info', label: 'Info' },
  { key: 'warning', label: 'Warning' },
  { key: 'critical', label: 'Critical' },
];

const TIME_RANGE_OPTIONS = [
  { key: '1h', label: 'Last Hour' },
  { key: '24h', label: 'Last 24 Hours' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
];

export default function AuditLogsPage() {
  const { user, isAdmin } = useContext(AppContext) as AppContextProps;
  const router = useRouter();
  const t = useTranslations('admin.auditLogs');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [search, setSearch] = useState('');

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      params.append('timeRange', timeRange);

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, severityFilter, timeRange]);

  const loadStatistics = useCallback(async () => {
    try {
      const params = new URLSearchParams({ timeRange });
      const response = await fetch(`/api/admin/audit-logs/statistics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, [timeRange]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    loadAuditLogs();
    loadStatistics();
  }, [user, isAdmin, router, loadAuditLogs, loadStatistics]);

  const getSeverityColor = (severity: string): 'danger' | 'warning' | 'success' | 'default' => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (
    category: string
  ): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' => {
    const map: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'> = {
      authentication: 'primary',
      admin_action: 'secondary',
      course_management: 'success',
      user_management: 'warning',
      payment: 'danger',
      security: 'danger',
      api_access: 'default',
      data_modification: 'primary',
    };
    return map[category] || 'default';
  };

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  // Client-side search across loaded logs
  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) =>
      [log.action, log.userEmail, log.ipAddress, log.resourceType, log.errorMessage]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [logs, search]);

  const handleExportCSV = useCallback(() => {
    if (!filteredLogs.length) return;
    const headers = [
      'Timestamp',
      'Severity',
      'Category',
      'Action',
      'Success',
      'User Email',
      'User Role',
      'IP Address',
      'Resource Type',
      'Resource ID',
      'Error Message',
    ];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.severity,
      log.category,
      log.action,
      log.success ? 'true' : 'false',
      log.userEmail || '',
      log.userRole || '',
      log.ipAddress || '',
      log.resourceType || '',
      log.resourceId || '',
      log.errorMessage || '',
    ]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map((c) => escape(String(c))).join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${timeRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredLogs, timeRange]);

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security"
        title={t('title')}
        description="Monitor and review system activity, security events, and admin actions"
        icon={<IconShield className="w-5 h-5" />}
        tone="danger"
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!filteredLogs.length}
            className="inline-flex items-center gap-2 px-3 h-9 text-sm font-medium rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 hover:bg-[color:var(--ai-card-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload size={14} />
            Export CSV
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('totalLogs')}
          value={statistics?.totalLogs ?? 0}
          icon={<IconActivity className="w-4 h-4" />}
          loading={!statistics}
        />
        <StatCard
          label={t('failedActions')}
          value={statistics?.failedActions ?? 0}
          tone="danger"
          icon={<FiX size={14} />}
          loading={!statistics}
        />
        <StatCard
          label={t('criticalEvents')}
          value={statistics?.bySeverity?.critical ?? 0}
          tone="danger"
          loading={!statistics}
        />
        <StatCard
          label={t('warnings')}
          value={statistics?.bySeverity?.warning ?? 0}
          tone="warning"
          loading={!statistics}
        />
      </div>

      {/* Filters */}
      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search action, email, IP, resource…"
        filters={
          <>
            <Select
              aria-label="Time range"
              size="sm"
              variant="flat"
              className="min-w-[150px]"
              selectedKeys={[timeRange]}
              onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
            >
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.key}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Select
              aria-label="Category"
              size="sm"
              variant="flat"
              className="min-w-[170px]"
              selectedKeys={[categoryFilter]}
              onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] as string)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.key}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Select
              aria-label="Severity"
              size="sm"
              variant="flat"
              className="min-w-[150px]"
              selectedKeys={[severityFilter]}
              onSelectionChange={(keys) => setSeverityFilter(Array.from(keys)[0] as string)}
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.key}>{opt.label}</SelectItem>
              ))}
            </Select>
          </>
        }
        actions={
          <Button
            size="sm"
            variant="flat"
            onClick={() => {
              loadAuditLogs();
              loadStatistics();
            }}
            isLoading={loading}
          >
            Refresh
          </Button>
        }
      />

      {/* Audit log entries */}
      <SectionCard
        title={t('recentActivity')}
        description={`Showing ${filteredLogs.length} ${filteredLogs.length === 1 ? 'event' : 'events'}`}
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={<IconActivity className="w-5 h-5" />}
            title={t('noLogsFound')}
            description="Try adjusting filters or expanding the time range."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id || index}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: Math.min(index * 0.02, 0.2) }}
                  className={`rounded-xl border p-4 transition-colors ${!log.success
                      ? 'border-[color:var(--ai-danger)]/40 bg-[color:var(--ai-danger)]/5'
                      : 'border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 hover:bg-[color:var(--ai-card-bg)]/70'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip color={getSeverityColor(log.severity)} size="sm" variant="flat">
                        {log.severity.toUpperCase()}
                      </Chip>
                      <Chip color={getCategoryColor(log.category)} size="sm" variant="flat">
                        {log.category.replace(/_/g, ' ').toUpperCase()}
                      </Chip>
                      {log.success ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          startContent={<FiCheckCircle size={12} />}
                        >
                          OK
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="flat" color="danger" startContent={<FiX size={12} />}>
                          FAILED
                        </Chip>
                      )}
                    </div>
                    <span className="text-xs text-[color:var(--ai-muted)] font-mono">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[color:var(--ai-foreground)] mb-2 text-sm">
                    {log.action}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    {log.userEmail && (
                      <Detail label={t('user')} value={log.userEmail} mono />
                    )}
                    {log.ipAddress && <Detail label="IP" value={log.ipAddress} mono />}
                    {log.resourceType && (
                      <Detail
                        label={t('resource')}
                        value={`${log.resourceType}${log.resourceId ? `: ${log.resourceId.substring(0, 8)}` : ''
                          }`}
                        mono
                      />
                    )}
                    {log.userRole && <Detail label={t('role')} value={log.userRole} />}
                  </div>

                  {log.errorMessage && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-[color:var(--ai-danger)]/10 border border-[color:var(--ai-danger)]/30 text-xs text-[color:var(--ai-danger)]">
                      {log.errorMessage}
                    </div>
                  )}

                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="mt-3 group">
                      <summary className="cursor-pointer text-xs text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] inline-flex items-center gap-1 select-none">
                        <span className="transition-transform group-open:rotate-90">›</span>
                        View raw details
                      </summary>
                      <pre className="mt-2 p-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg text-[11px] overflow-auto leading-relaxed max-h-72">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--ai-muted)]">
        {label}
      </div>
      <div
        className={`text-[color:var(--ai-foreground)] truncate ${mono ? 'font-mono text-[11px]' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}
