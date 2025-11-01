'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/modules/authContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Button,
  Select,
  SelectItem,
} from '@heroui/react';
import { motion } from 'framer-motion';

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

export default function AuditLogsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const t = useTranslations('admin.auditLogs');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

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
  }, [user, isAdmin, router, categoryFilter, severityFilter, timeRange]);

  const loadAuditLogs = async () => {
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
  };

  const loadStatistics = async () => {
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
  };

  const getSeverityColor = (severity: string) => {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, any> = {
      authentication: 'primary',
      admin_action: 'secondary',
      course_management: 'success',
      user_management: 'warning',
      payment: 'danger',
      security: 'danger',
      api_access: 'default',
      data_modification: 'primary',
    };
    return colors[category] || 'default';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[color:var(--section-light-bg)] to-[color:var(--section-accent-bg)] dark:from-[color:var(--section-dark-bg)] dark:to-[color:var(--ai-background)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[color:var(--ai-foreground)] mb-2">{t('title')}</h1>
          <p className="text-[color:var(--ai-muted)]">
            Monitor and review system activity, security events, and admin actions
          </p>
        </motion.div>

        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-[color:var(--ai-muted)]">{t('totalLogs')}</p>
                <p className="text-3xl font-bold text-[color:var(--ai-foreground)]">
                  {statistics.totalLogs}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-[color:var(--ai-muted)]">{t('failedActions')}</p>
                <p className="text-3xl font-bold text-[color:var(--ai-error)]">
                  {statistics.failedActions}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-[color:var(--ai-muted)]">{t('criticalEvents')}</p>
                <p className="text-3xl font-bold text-[color:var(--ai-warning)]">
                  {statistics.bySeverity.critical || 0}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-[color:var(--ai-muted)]">{t('warnings')}</p>
                <p className="text-3xl font-bold text-[color:var(--ai-warning)]">
                  {statistics.bySeverity.warning || 0}
                </p>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Time Range"
                selectedKeys={[timeRange]}
                onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
              >
                <SelectItem key="1h">Last Hour</SelectItem>
                <SelectItem key="24h">Last 24 Hours</SelectItem>
                <SelectItem key="7d">Last 7 Days</SelectItem>
                <SelectItem key="30d">Last 30 Days</SelectItem>
              </Select>

              <Select
                label="Category"
                selectedKeys={[categoryFilter]}
                onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Categories</SelectItem>
                <SelectItem key="authentication">Authentication</SelectItem>
                <SelectItem key="admin_action">Admin Actions</SelectItem>
                <SelectItem key="course_management">Course Management</SelectItem>
                <SelectItem key="user_management">User Management</SelectItem>
                <SelectItem key="payment">Payment</SelectItem>
                <SelectItem key="security">Security</SelectItem>
              </Select>

              <Select
                label="Severity"
                selectedKeys={[severityFilter]}
                onSelectionChange={(keys) => setSeverityFilter(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Severities</SelectItem>
                <SelectItem key="info">Info</SelectItem>
                <SelectItem key="warning">Warning</SelectItem>
                <SelectItem key="critical">Critical</SelectItem>
              </Select>

              <Button
                color="primary"
                onClick={() => {
                  loadAuditLogs();
                  loadStatistics();
                }}
              >
                Refresh
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Audit Logs List */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">{t('recentActivity')}</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-[color:var(--ai-muted)]">{t('loading')}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[color:var(--ai-muted)]">{t('noLogsFound')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-[color:var(--ai-card-border)] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Chip color={getSeverityColor(log.severity)} size="sm" variant="flat">
                          {log.severity.toUpperCase()}
                        </Chip>
                        <Chip color={getCategoryColor(log.category)} size="sm" variant="flat">
                          {log.category.replace('_', ' ').toUpperCase()}
                        </Chip>
                        {!log.success && (
                          <Chip color="danger" size="sm" variant="flat">
                            FAILED
                          </Chip>
                        )}
                      </div>
                      <span className="text-sm text-[color:var(--ai-muted)]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-[color:var(--ai-foreground)] mb-2">
                      {log.action}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {log.userEmail && (
                        <div>
                          <span className="text-[color:var(--ai-muted)]">{t('user')} </span>
                          <span className="text-[color:var(--ai-foreground)]">{log.userEmail}</span>
                        </div>
                      )}
                      {log.ipAddress && (
                        <div>
                          <span className="text-[color:var(--ai-muted)]">IP: </span>
                          <span className="text-[color:var(--ai-foreground)]">{log.ipAddress}</span>
                        </div>
                      )}
                      {log.resourceType && (
                        <div>
                          <span className="text-[color:var(--ai-muted)]">{t('resource')} </span>
                          <span className="text-[color:var(--ai-foreground)]">
                            {log.resourceType}
                            {log.resourceId && `: ${log.resourceId.substring(0, 8)}`}
                          </span>
                        </div>
                      )}
                      {log.userRole && (
                        <div>
                          <span className="text-[color:var(--ai-muted)]">{t('role')} </span>
                          <span className="text-[color:var(--ai-foreground)]">{log.userRole}</span>
                        </div>
                      )}
                    </div>

                    {log.errorMessage && (
                      <div className="mt-2 p-2 bg-[color:var(--ai-error)]/10 rounded text-sm text-[color:var(--ai-error)]">
                        {log.errorMessage}
                      </div>
                    )}

                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded text-xs overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
