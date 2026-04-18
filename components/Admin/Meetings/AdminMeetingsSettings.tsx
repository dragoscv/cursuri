'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@heroui/react';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppButton } from '@/components/shared/ui';
import { SectionCard } from '@/components/Admin/shell';
import { useToast } from '@/components/Toast/ToastContext';
import type { MeetingsConfig, WeekdayWindow } from '@/types/meetings';
import { DEFAULT_MEETINGS_CONFIG } from '@/utils/meetings/config';

async function api<T = any>(
  url: string,
  method: 'GET' | 'PUT' = 'GET',
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

function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(':').map((x) => Number(x) || 0);
  return h * 60 + m;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] focus:outline-none focus:border-[color:var(--ai-primary)] text-sm';
const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-[color:var(--ai-muted)] mb-1.5';
const hintCls = 'text-xs text-[color:var(--ai-muted)] mt-1';

const AdminMeetingsSettings: React.FC = () => {
  const t = useTranslations('meetings.admin.settings');
  const { showToast } = useToast();
  const [config, setConfig] = useState<MeetingsConfig>(DEFAULT_MEETINGS_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blackoutInput, setBlackoutInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await api<{ success: boolean; config: MeetingsConfig }>(
        '/api/admin/meetings/config'
      );
      setConfig(json.config);
    } catch (err) {
      console.error('Failed to load config', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = <K extends keyof MeetingsConfig>(key: K, value: MeetingsConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
  };

  const updateWeekday = (day: string, patch: Partial<WeekdayWindow>) => {
    setConfig((c) => ({
      ...c,
      weeklyAvailability: {
        ...c.weeklyAvailability,
        [day]: { ...c.weeklyAvailability[day], ...patch },
      },
    }));
  };

  const addBlackout = () => {
    const v = blackoutInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    if (config.blackoutDates.includes(v)) return;
    setConfig((c) => ({ ...c, blackoutDates: [...c.blackoutDates, v].sort() }));
    setBlackoutInput('');
  };

  const removeBlackout = (d: string) => {
    setConfig((c) => ({ ...c, blackoutDates: c.blackoutDates.filter((x) => x !== d) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        enabled: config.enabled,
        hourlyRateAmount: Number(config.hourlyRateAmount),
        currency: config.currency.toLowerCase(),
        minLeadTimeHours: Number(config.minLeadTimeHours),
        maxLeadTimeHours: Number(config.maxLeadTimeHours),
        minDurationMinutes: Number(config.minDurationMinutes),
        maxDurationMinutes: Number(config.maxDurationMinutes),
        durationStepMinutes: Number(config.durationStepMinutes),
        bufferMinutes: Number(config.bufferMinutes),
        weeklyAvailability: config.weeklyAvailability,
        blackoutDates: config.blackoutDates,
        timezone: config.timezone,
        requiresActiveSubscription: config.requiresActiveSubscription,
        publicNote: config.publicNote || '',
      };
      const res = await api<{ success: boolean; config: MeetingsConfig }>(
        '/api/admin/meetings/config',
        'PUT',
        payload
      );
      setConfig(res.config);
      showToast({ type: 'success', message: t('saved') });
    } catch (err: any) {
      console.error('Save failed', err);
      showToast({ type: 'error', title: t('saveFailed'), message: err?.message || '' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const days = ['1', '2', '3', '4', '5', '6', '0']; // Mon..Sun

  return (
    <div className="space-y-6">
      <SectionCard title={t('sections.general')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateField('enabled', e.target.checked)}
              className="mt-1 h-4 w-4 accent-[color:var(--ai-primary)]"
            />
            <div className="min-w-0">
              <div className="font-medium text-sm text-[color:var(--ai-foreground)]">
                {t('fields.enabled')}
              </div>
              <div className={hintCls}>{t('fields.enabledHint')}</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] cursor-pointer">
            <input
              type="checkbox"
              checked={config.requiresActiveSubscription}
              onChange={(e) => updateField('requiresActiveSubscription', e.target.checked)}
              className="mt-1 h-4 w-4 accent-[color:var(--ai-primary)]"
            />
            <div className="min-w-0">
              <div className="font-medium text-sm text-[color:var(--ai-foreground)]">
                {t('fields.requiresActiveSubscription')}
              </div>
              <div className={hintCls}>{t('fields.requiresActiveSubscriptionHint')}</div>
            </div>
          </label>

          <div>
            <label className={labelCls}>{t('fields.timezone')}</label>
            <input
              type="text"
              value={config.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className={inputCls}
              placeholder="Europe/Bucharest"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>{t('fields.publicNote')}</label>
            <textarea
              value={config.publicNote || ''}
              onChange={(e) => updateField('publicNote', e.target.value)}
              className={`${inputCls} min-h-[80px]`}
              maxLength={500}
            />
            <div className={hintCls}>{t('fields.publicNoteHint')}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('sections.pricing')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t('fields.hourlyRate')}</label>
            <input
              type="number"
              min={0}
              step={1}
              value={config.hourlyRateAmount}
              onChange={(e) => updateField('hourlyRateAmount', Number(e.target.value))}
              className={inputCls}
            />
            <div className={hintCls}>
              In smallest unit (cents/bani). Currently:{' '}
              {(config.hourlyRateAmount / 100).toFixed(2)} {config.currency.toUpperCase()}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('fields.currency')}</label>
            <input
              type="text"
              value={config.currency}
              onChange={(e) => updateField('currency', e.target.value.toLowerCase().slice(0, 3))}
              className={inputCls}
              placeholder="eur"
              maxLength={3}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('sections.duration')}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>{t('fields.minDuration')}</label>
            <input
              type="number"
              min={5}
              max={480}
              value={config.minDurationMinutes}
              onChange={(e) => updateField('minDurationMinutes', Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t('fields.maxDuration')}</label>
            <input
              type="number"
              min={5}
              max={480}
              value={config.maxDurationMinutes}
              onChange={(e) => updateField('maxDurationMinutes', Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t('fields.durationStep')}</label>
            <input
              type="number"
              min={5}
              max={120}
              value={config.durationStepMinutes}
              onChange={(e) => updateField('durationStepMinutes', Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t('fields.buffer')}</label>
            <input
              type="number"
              min={0}
              max={240}
              value={config.bufferMinutes}
              onChange={(e) => updateField('bufferMinutes', Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('sections.leadTime')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t('fields.minLead')}</label>
            <input
              type="number"
              min={0}
              value={config.minLeadTimeHours}
              onChange={(e) => updateField('minLeadTimeHours', Number(e.target.value))}
              className={inputCls}
            />
            <div className={hintCls}>{t('fields.minLeadHint')}</div>
          </div>
          <div>
            <label className={labelCls}>{t('fields.maxLead')}</label>
            <input
              type="number"
              min={1}
              value={config.maxLeadTimeHours}
              onChange={(e) => updateField('maxLeadTimeHours', Number(e.target.value))}
              className={inputCls}
            />
            <div className={hintCls}>{t('fields.maxLeadHint')}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('sections.weekly')}>
        <div className="space-y-2">
          {days.map((d) => {
            const w = config.weeklyAvailability[d];
            return (
              <div
                key={d}
                className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]"
              >
                <label className="flex items-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={w.enabled}
                    onChange={(e) => updateWeekday(d, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-[color:var(--ai-primary)]"
                  />
                  <span className="text-sm font-medium">{t(`weekdays.${d}`)}</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[color:var(--ai-muted)]">
                    {t('fields.windowStart')}
                  </span>
                  <input
                    type="time"
                    value={minutesToHHMM(w.startMinutes)}
                    disabled={!w.enabled}
                    onChange={(e) => updateWeekday(d, { startMinutes: hhmmToMinutes(e.target.value) })}
                    className={`${inputCls} w-28`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[color:var(--ai-muted)]">
                    {t('fields.windowEnd')}
                  </span>
                  <input
                    type="time"
                    value={minutesToHHMM(w.endMinutes)}
                    disabled={!w.enabled}
                    onChange={(e) => updateWeekday(d, { endMinutes: hhmmToMinutes(e.target.value) })}
                    className={`${inputCls} w-28`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title={t('sections.blackout')}>
        <div className="flex items-end gap-2 mb-3">
          <div className="flex-1 max-w-xs">
            <label className={labelCls}>{t('fields.blackoutDates')}</label>
            <input
              type="date"
              value={blackoutInput}
              onChange={(e) => setBlackoutInput(e.target.value)}
              className={inputCls}
            />
            <div className={hintCls}>{t('fields.blackoutDatesHint')}</div>
          </div>
          <AppButton variant="secondary" size="md" onPress={addBlackout}>
            {t('fields.addBlackout')}
          </AppButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.blackoutDates.length === 0 ? (
            <div className="text-sm text-[color:var(--ai-muted)]">—</div>
          ) : (
            config.blackoutDates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-foreground)] text-xs border border-[color:var(--ai-card-border)]"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeBlackout(d)}
                  className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-error,#ef4444)]"
                  aria-label={t('fields.removeBlackout')}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </SectionCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <AppButton variant="primary" size="lg" onPress={save} isLoading={saving} loadingText={t('saving')}>
          {t('save')}
        </AppButton>
      </div>
    </div>
  );
};

export default AdminMeetingsSettings;
