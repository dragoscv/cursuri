'use client';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner, Chip } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { GradientCard, MetricCard, SectionShell } from '@/components/user-shell';
import { AppButton } from '@/components/shared/ui';
import { FiCalendar, FiCheck } from '@/components/icons/FeatherIcons';
import type { Meeting, MeetingStatus } from '@/types/meetings';

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

const statusToTone: Record<MeetingStatus, { color: 'default' | 'success' | 'warning' | 'danger' | 'primary'; key: string }> = {
  pending_payment: { color: 'warning', key: 'pendingPayment' },
  confirmed: { color: 'success', key: 'confirmed' },
  completed: { color: 'primary', key: 'completed' },
  cancelled: { color: 'default', key: 'cancelled' },
  no_show: { color: 'danger', key: 'noShow' },
};

export default function MyMeetingsPage() {
  const t = useTranslations('meetings.myMeetings');
  const tCheckout = useTranslations('meetings.checkout');
  const search = useSearchParams();
  const ctx = useContext(AppContext);
  const user = ctx?.user;
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const showSuccess = search.get('status') === 'success';

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/meetings/mine', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success) setMeetings(json.meetings || []);
    } catch (err) {
      console.error('Failed to load meetings', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const now = Date.now();
    let upcoming = 0;
    let completed = 0;
    let totalSpent = 0;
    let currency = 'eur';
    for (const m of meetings) {
      if ((m.status === 'confirmed' || m.status === 'pending_payment') && m.startAt > now) upcoming++;
      if (m.status === 'completed') completed++;
      if (m.status === 'confirmed' || m.status === 'completed') {
        totalSpent += m.totalAmount || 0;
        currency = m.currency || currency;
      }
    }
    return { upcoming, completed, totalSpent, currency };
  }, [meetings]);

  if (!user) {
    return (
      <div className="p-8 text-center text-[color:var(--ai-muted)]">
        {t('empty.description')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-[color:var(--ai-success,#10b981)]/30 bg-[color:var(--ai-success,#10b981)]/10 p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[color:var(--ai-success,#10b981)]/20 grid place-items-center flex-shrink-0">
              <FiCheck size={18} className="text-[color:var(--ai-success,#10b981)]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[color:var(--ai-foreground)]">
                {tCheckout('successTitle')}
              </div>
              <div className="text-sm text-[color:var(--ai-muted)] mt-0.5">
                {tCheckout('successDescription')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GradientCard className="p-0 overflow-hidden" flush>
        <div className="relative p-6 md:p-8">
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--ai-primary) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--ai-secondary) 18%, transparent) 0%, transparent 55%)',
            }}
          />
          <div className="relative flex items-start gap-4">
            <div className="grid place-items-center w-12 h-12 rounded-2xl bg-[color:var(--ai-foreground)]/8 text-[color:var(--ai-foreground)] flex-shrink-0">
              <FiCalendar size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ai-foreground)]">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm md:text-base text-[color:var(--ai-muted)] max-w-xl">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>
      </GradientCard>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <MetricCard label={t('stats.upcoming')} value={stats.upcoming} tone="primary" />
        <MetricCard label={t('stats.completed')} value={stats.completed} tone="success" />
        <MetricCard
          label={t('stats.totalSpent')}
          value={formatMoney(stats.totalSpent, stats.currency)}
          tone="warning"
        />
      </div>

      <SectionShell
        title={t('title')}
        eyebrow={t('stats.upcoming')}
        actions={
          <Link href="/book-a-call">
            <AppButton variant="primary" size="md">
              {t('empty.cta')}
            </AppButton>
          </Link>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[color:var(--ai-primary)]/10 grid place-items-center mx-auto mb-4">
              <FiCalendar size={28} className="text-[color:var(--ai-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
              {t('empty.title')}
            </h3>
            <p className="mt-1 text-sm text-[color:var(--ai-muted)]">{t('empty.description')}</p>
            <Link href="/book-a-call">
              <AppButton variant="primary" size="md" className="mt-5">
                {t('empty.cta')}
              </AppButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-1">
            {meetings.map((m, i) => {
              const tone = statusToTone[m.status];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] p-5 hover:border-[color:var(--ai-primary)]/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip color={tone.color} size="sm" variant="flat">
                          {t(`card.${tone.key}`)}
                        </Chip>
                        <span className="text-xs text-[color:var(--ai-muted)]">
                          {t('card.duration', { minutes: m.durationMinutes })}
                        </span>
                        <span className="text-xs text-[color:var(--ai-muted)]">·</span>
                        <span className="text-xs font-medium text-[color:var(--ai-foreground)]">
                          {formatMoney(m.totalAmount, m.currency)}
                        </span>
                      </div>
                      <div className="mt-2 text-base font-semibold text-[color:var(--ai-foreground)]">
                        {formatDateTime(m.startAt, m.timezone)}
                      </div>
                      <div className="mt-1 text-xs text-[color:var(--ai-muted)]">
                        {m.timezone}
                      </div>
                      <div className="mt-3">
                        <div className="text-xs uppercase tracking-wide text-[color:var(--ai-muted)] font-semibold">
                          {t('card.topic')}
                        </div>
                        <div className="text-sm text-[color:var(--ai-foreground)] mt-0.5 break-words">
                          {m.topic}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[200px]">
                      {m.meetLink ? (
                        <a href={m.meetLink} target="_blank" rel="noreferrer">
                          <AppButton variant="primary" size="sm" fullWidth>
                            {t('card.joinLink')}
                          </AppButton>
                        </a>
                      ) : m.status === 'confirmed' ? (
                        <div className="text-xs text-[color:var(--ai-muted)] text-center md:text-right">
                          {t('card.linkPending')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionShell>
    </div>
  );
}
