'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Chip, Spinner } from '@heroui/react';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppButton, AppModal } from '@/components/shared/ui';
import { SectionCard, EmptyState } from '@/components/Admin/shell';
import { FiCalendar, FiCheck, FiX, FiClock, FiEdit } from '@/components/icons/FeatherIcons';
import type { Meeting, MeetingStatus } from '@/types/meetings';

async function api<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: any
): Promise<T> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDateTime(ms: number, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone || undefined,
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
}

const STATUS_TONES: Record<MeetingStatus, 'default' | 'success' | 'warning' | 'danger' | 'primary'> = {
  pending_payment: 'warning',
  confirmed: 'success',
  completed: 'primary',
  cancelled: 'default',
  no_show: 'danger',
};

const STATUS_FILTERS: Array<MeetingStatus | 'all'> = [
  'all',
  'confirmed',
  'pending_payment',
  'completed',
  'cancelled',
  'no_show',
];

const AdminMeetings: React.FC = () => {
  const t = useTranslations('meetings.admin.list');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MeetingStatus | 'all'>('all');
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await api<{ success: boolean; meetings: Meeting[] }>(
        `/api/admin/meetings?status=${filter}`
      );
      setMeetings(json.meetings || []);
    } catch (err) {
      console.error('Failed to load admin meetings', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = meetings;

  const openEditor = (m: Meeting) => {
    setEditing(m);
    setLinkInput(m.meetLink || '');
  };

  const closeEditor = () => {
    setEditing(null);
    setLinkInput('');
    setSaving(false);
  };

  const saveLink = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api(`/api/admin/meetings/${editing.id}`, 'PATCH', { meetLink: linkInput.trim() });
      await load();
      closeEditor();
    } catch (err: any) {
      console.error('Save link failed', err);
      alert(err?.message || 'Failed to save link');
      setSaving(false);
    }
  };

  const setStatus = async (m: Meeting, status: MeetingStatus, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    try {
      await api(`/api/admin/meetings/${m.id}`, 'PATCH', { status });
      await load();
    } catch (err: any) {
      console.error('Status update failed', err);
      alert(err?.message || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              filter === f
                ? 'bg-[color:var(--ai-primary)] text-white border-transparent'
                : 'bg-transparent text-[color:var(--ai-foreground)] border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50'
            }`}
          >
            {t(`filter.${f}`)}
          </button>
        ))}
      </div>

      <SectionCard title={t('title')} description={t('description')}>
        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiCalendar size={32} />}
            title={t('empty')}
            description=""
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--ai-muted)]">
                  <th className="px-3 py-2">{t('user')}</th>
                  <th className="px-3 py-2">{t('when')}</th>
                  <th className="px-3 py-2">{t('duration')}</th>
                  <th className="px-3 py-2">{t('topic')}</th>
                  <th className="px-3 py-2">{t('status')}</th>
                  <th className="px-3 py-2">{t('amount')}</th>
                  <th className="px-3 py-2 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-[color:var(--ai-card-border)] hover:bg-[color:var(--ai-primary)]/5"
                  >
                    <td className="px-3 py-3 align-top">
                      <div className="font-medium text-[color:var(--ai-foreground)]">{m.userName}</div>
                      <div className="text-xs text-[color:var(--ai-muted)]">{m.userEmail}</div>
                    </td>
                    <td className="px-3 py-3 align-top whitespace-nowrap">
                      <div>{formatDateTime(m.startAt, m.timezone)}</div>
                      <div className="text-xs text-[color:var(--ai-muted)]">{m.timezone}</div>
                    </td>
                    <td className="px-3 py-3 align-top whitespace-nowrap">{m.durationMinutes} min</td>
                    <td className="px-3 py-3 align-top max-w-[280px]">
                      <div className="text-sm text-[color:var(--ai-foreground)] line-clamp-2">{m.topic}</div>
                      {m.notes && (
                        <div className="text-xs text-[color:var(--ai-muted)] line-clamp-2 mt-0.5">
                          {m.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Chip color={STATUS_TONES[m.status]} size="sm" variant="flat">
                        {t(`filter.${m.status}`)}
                      </Chip>
                    </td>
                    <td className="px-3 py-3 align-top whitespace-nowrap">
                      {formatMoney(m.totalAmount, m.currency)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <AppButton
                          size="sm"
                          variant="secondary"
                          onPress={() => openEditor(m)}
                          startContent={m.meetLink ? <FiEdit size={14} /> : <FiCalendar size={14} />}
                        >
                          {m.meetLink ? t('editLink') : t('addLink')}
                        </AppButton>
                        {m.status === 'confirmed' && (
                          <>
                            <AppButton
                              size="sm"
                              variant="primary"
                              onPress={() => setStatus(m, 'completed')}
                              startContent={<FiCheck size={14} />}
                            >
                              {t('markCompleted')}
                            </AppButton>
                            <AppButton
                              size="sm"
                              variant="secondary"
                              onPress={() => setStatus(m, 'no_show')}
                              startContent={<FiClock size={14} />}
                            >
                              {t('markNoShow')}
                            </AppButton>
                          </>
                        )}
                        {(m.status === 'confirmed' || m.status === 'pending_payment') && (
                          <AppButton
                            size="sm"
                            variant="secondary"
                            onPress={() => setStatus(m, 'cancelled', t('cancelConfirm'))}
                            startContent={<FiX size={14} />}
                          >
                            {t('cancel')}
                          </AppButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {editing && (
        <AppModal
          isOpen={!!editing}
          onClose={closeEditor}
          title={editing.meetLink ? t('editLink') : t('addLink')}
          size="md"
        >
          <div className="space-y-4 p-2">
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder={t('linkPlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] focus:outline-none focus:border-[color:var(--ai-primary)]"
            />
            <div className="flex justify-end gap-2">
              <AppButton variant="secondary" size="md" onPress={closeEditor}>
                {t('cancel')}
              </AppButton>
              <AppButton variant="primary" size="md" onPress={saveLink} isLoading={saving}>
                {t('saveLink')}
              </AppButton>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
};

export default AdminMeetings;
