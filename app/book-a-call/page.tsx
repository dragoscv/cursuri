'use client';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { AppButton } from '@/components/shared/ui';
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiMessageSquare,
  FiArrowRight,
} from '@/components/icons/FeatherIcons';
import type { AvailabilitySlot, PublicMeetingsConfig } from '@/types/meetings';
import { computeMeetingPrice } from '@/utils/meetings/config';

// ---------------- helpers ----------------

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

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDayLocal(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatTimeOnly(ms: number, tz?: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleTimeString();
  }
}

function formatLongDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

// ---------------- main page ----------------

type Stage = 'duration' | 'date' | 'time' | 'confirm';

export default function BookACallPage() {
  const t = useTranslations('meetings');
  const router = useRouter();
  const search = useSearchParams();
  const ctx = useContext(AppContext);
  const user = ctx?.user;
  const isSubscribed = useMemo(
    () =>
      (ctx?.subscriptions || []).some(
        (s: any) => s?.status === 'active' || s?.status === 'trialing'
      ),
    [ctx?.subscriptions]
  );

  const cancelledStatus = search.get('status') === 'cancelled';

  const [config, setConfig] = useState<PublicMeetingsConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [stage, setStage] = useState<Stage>('duration');
  const [duration, setDuration] = useState<number>(60);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDayLocal(new Date()));
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userTimezone = getBrowserTimezone();

  // Load config
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/meetings/config', { cache: 'no-store' });
        const json = await res.json();
        if (json.success) {
          setConfig(json.config);
          // Initialize duration to a valid value within constraints.
          if (json.config?.minDurationMinutes) {
            setDuration((d) => {
              const min = json.config.minDurationMinutes;
              const max = json.config.maxDurationMinutes;
              const step = json.config.durationStepMinutes || 30;
              const def = Math.max(min, Math.min(60, max));
              const aligned = Math.round(def / step) * step;
              return Math.max(min, Math.min(max, aligned));
            });
            // Default selected date = first day in lead-time window.
            const earliest = new Date(Date.now() + (json.config.minLeadTimeHours || 0) * 3_600_000);
            setSelectedDate(startOfDayLocal(earliest));
          }
        }
      } catch (err) {
        console.error('Failed to load meetings config', err);
      } finally {
        setLoadingConfig(false);
      }
    })();
  }, []);

  // Load slots when date or duration changes (only after auth + sub gates passed)
  const fetchSlots = useCallback(async () => {
    if (!config?.enabled) return;
    const dayStart = startOfDayLocal(selectedDate).getTime();
    const dayEnd = addDays(startOfDayLocal(selectedDate), 1).getTime();
    setLoadingSlots(true);
    try {
      const url = `/api/meetings/availability?from=${dayStart}&to=${dayEnd}&duration=${duration}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) setSlots(json.slots || []);
      else setSlots([]);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [config, selectedDate, duration]);

  useEffect(() => {
    if (stage === 'time') fetchSlots();
  }, [stage, fetchSlots]);

  const durations = useMemo(() => {
    if (!config) return [60];
    const out: number[] = [];
    for (
      let d = config.minDurationMinutes;
      d <= config.maxDurationMinutes;
      d += config.durationStepMinutes
    ) {
      out.push(d);
    }
    return out;
  }, [config]);

  const dateOptions = useMemo(() => {
    if (!config) return [];
    const earliest = startOfDayLocal(
      new Date(Date.now() + Math.max(0, (config.minLeadTimeHours - 24)) * 3_600_000)
    );
    const latest = startOfDayLocal(
      new Date(Date.now() + config.maxLeadTimeHours * 3_600_000)
    );
    const days: Date[] = [];
    let cursor = earliest;
    let i = 0;
    while (cursor.getTime() <= latest.getTime() && i < 60) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
      i++;
    }
    return days;
  }, [config]);

  const submitBooking = async () => {
    if (!selectedSlot || !user) return;
    if (!topic.trim() || topic.trim().length < 3) {
      setError(t('booking.errors.topic_required'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/meetings/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startAt: selectedSlot.startAt,
          durationMinutes: duration,
          topic: topic.trim(),
          notes: notes.trim() || undefined,
          timezone: userTimezone,
        }),
      });
      const json = await res.json();
      if (json.success && json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
      const code = json?.error || 'checkout_failed';
      setError(t(`booking.errors.${code}` as any) || code);
    } catch (err: any) {
      setError(err?.message || t('booking.errors.checkout_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- gates / states ----------------

  if (loadingConfig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 60% at 20% 0%, color-mix(in srgb, var(--ai-primary) 12%, transparent) 0%, transparent 60%), radial-gradient(50% 50% at 80% 30%, color-mix(in srgb, var(--ai-secondary) 12%, transparent) 0%, transparent 60%), radial-gradient(40% 40% at 50% 80%, color-mix(in srgb, var(--ai-accent) 8%, transparent) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] text-xs font-semibold uppercase tracking-wider border border-[color:var(--ai-primary)]/20"
          >
            <FiCalendar size={14} />
            {t('landing.eyebrow')}
          </motion.span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[color:var(--ai-foreground)] leading-tight">
            <span className="block">{t('landing.title').split(' ').slice(0, -2).join(' ')}</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]">
              {t('landing.title').split(' ').slice(-2).join(' ')}
            </span>
          </h1>
          <p className="mt-5 text-lg text-[color:var(--ai-muted)] leading-relaxed max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>
          {config?.enabled && (
            <div className="mt-6 inline-flex items-baseline gap-2 px-5 py-2 rounded-full bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)]">
              <span className="text-2xl font-bold text-[color:var(--ai-foreground)]">
                {formatMoney(config.hourlyRateAmount, config.currency)}
              </span>
              <span className="text-sm text-[color:var(--ai-muted)]">/ hour</span>
            </div>
          )}
        </motion.section>

        {/* Cancelled banner */}
        <AnimatePresence>
          {cancelledStatus && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[color:var(--ai-warning,#f59e0b)]/30 bg-[color:var(--ai-warning,#f59e0b)]/10 p-4 text-sm text-[color:var(--ai-foreground)] max-w-3xl mx-auto"
            >
              <div className="font-semibold">{t('checkout.cancelledTitle')}</div>
              <div className="text-[color:var(--ai-muted)] mt-1">
                {t('checkout.cancelledDescription')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disabled state */}
        {!config?.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto rounded-3xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[color:var(--ai-muted)]/10 grid place-items-center mb-4">
              <FiClock size={28} className="text-[color:var(--ai-muted)]" />
            </div>
            <h2 className="text-xl font-bold text-[color:var(--ai-foreground)]">
              {t('landing.currentlyUnavailable.title')}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ai-muted)]">
              {t('landing.currentlyUnavailable.description')}
            </p>
          </motion.div>
        )}

        {/* Auth gate */}
        {config?.enabled && !user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto rounded-3xl border border-[color:var(--ai-primary)]/30 bg-gradient-to-br from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent p-8 text-center"
          >
            <h2 className="text-xl font-bold text-[color:var(--ai-foreground)]">
              {t('landing.ctaSecondary')}
            </h2>
            <Link href="/profile">
              <AppButton variant="primary" size="lg" className="mt-4">
                {t('landing.ctaSecondary')}
              </AppButton>
            </Link>
          </motion.div>
        )}

        {/* Subscription gate */}
        {config?.enabled && user && config.requiresActiveSubscription && !isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto rounded-3xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[color:var(--ai-primary)]/10 grid place-items-center mb-4">
              <FiCalendar size={28} className="text-[color:var(--ai-primary)]" />
            </div>
            <h2 className="text-xl font-bold text-[color:var(--ai-foreground)]">
              {t('landing.subscriptionRequired.title')}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ai-muted)]">
              {t('landing.subscriptionRequired.description')}
            </p>
            <Link href="/subscriptions">
              <AppButton variant="primary" size="lg" className="mt-5">
                {t('landing.subscriptionRequired.cta')}
              </AppButton>
            </Link>
          </motion.div>
        )}

        {/* Booking flow */}
        {config?.enabled && user && (!config.requiresActiveSubscription || isSubscribed) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto rounded-3xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] overflow-hidden"
          >
            {/* Stepper */}
            <div className="border-b border-[color:var(--ai-card-border)] px-6 py-4 flex items-center gap-2 overflow-x-auto">
              {(['duration', 'date', 'time', 'confirm'] as Stage[]).map((s, i) => {
                const isActive = stage === s;
                const stepKey = `step${i + 1}Title` as
                  | 'step1Title'
                  | 'step2Title'
                  | 'step3Title'
                  | 'step4Title';
                return (
                  <button
                    key={s}
                    onClick={() => {
                      // allow going back, never skipping forward
                      const order = ['duration', 'date', 'time', 'confirm'];
                      if (order.indexOf(s) <= order.indexOf(stage)) setStage(s);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                      isActive
                        ? 'bg-[color:var(--ai-primary)] text-white'
                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                    }`}
                  >
                    <span
                      className={`grid place-items-center w-5 h-5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {t(`booking.${stepKey}`)}
                  </button>
                );
              })}
            </div>

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {stage === 'duration' && (
                  <motion.div
                    key="duration"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {durations.map((d) => {
                        const selected = duration === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={`relative rounded-2xl border p-4 text-left transition ${
                              selected
                                ? 'border-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/5'
                                : 'border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50'
                            }`}
                          >
                            <div className="text-xl font-bold text-[color:var(--ai-foreground)]">
                              {t('booking.durationMinutes', { minutes: d })}
                            </div>
                            <div className="mt-1 text-xs text-[color:var(--ai-muted)]">
                              {formatMoney(
                                computeMeetingPrice(config.hourlyRateAmount, d),
                                config.currency
                              )}
                            </div>
                            {selected && (
                              <FiCheck
                                size={16}
                                className="absolute top-3 right-3 text-[color:var(--ai-primary)]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <AppButton variant="primary" size="md" onPress={() => setStage('date')}>
                        {t('booking.next')}
                      </AppButton>
                    </div>
                  </motion.div>
                )}

                {stage === 'date' && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                  >
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                      {dateOptions.map((d) => {
                        const selected = ymd(d) === ymd(selectedDate);
                        const dayName = new Intl.DateTimeFormat(undefined, {
                          weekday: 'short',
                        }).format(d);
                        return (
                          <button
                            key={d.toISOString()}
                            onClick={() => setSelectedDate(d)}
                            className={`rounded-xl border p-2 text-center transition ${
                              selected
                                ? 'border-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-foreground)]'
                                : 'border-[color:var(--ai-card-border)] text-[color:var(--ai-muted)] hover:border-[color:var(--ai-primary)]/50 hover:text-[color:var(--ai-foreground)]'
                            }`}
                          >
                            <div className="text-[10px] uppercase tracking-wider">{dayName}</div>
                            <div className="text-lg font-bold mt-0.5">{d.getDate()}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex justify-between">
                      <AppButton variant="secondary" size="md" onPress={() => setStage('duration')}>
                        {t('booking.back')}
                      </AppButton>
                      <AppButton variant="primary" size="md" onPress={() => setStage('time')}>
                        {t('booking.next')}
                      </AppButton>
                    </div>
                  </motion.div>
                )}

                {stage === 'time' && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                  >
                    <div className="mb-4 text-sm text-[color:var(--ai-muted)]">
                      {formatLongDate(selectedDate)} · {t('booking.timezoneLabel')}: {userTimezone}
                    </div>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center p-12">
                        <Spinner size="lg" />
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center text-sm text-[color:var(--ai-muted)] p-8">
                        {t('booking.noSlots')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {slots.map((s) => {
                          const selected = selectedSlot?.startAt === s.startAt;
                          return (
                            <button
                              key={s.startAt}
                              onClick={() => setSelectedSlot(s)}
                              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                selected
                                  ? 'border-[color:var(--ai-primary)] bg-[color:var(--ai-primary)] text-white'
                                  : 'border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] hover:border-[color:var(--ai-primary)]/50'
                              }`}
                            >
                              {formatTimeOnly(s.startAt, userTimezone)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-6 flex justify-between">
                      <AppButton variant="secondary" size="md" onPress={() => setStage('date')}>
                        {t('booking.back')}
                      </AppButton>
                      <AppButton
                        variant="primary"
                        size="md"
                        onPress={() => setStage('confirm')}
                        isDisabled={!selectedSlot}
                      >
                        {t('booking.next')}
                      </AppButton>
                    </div>
                  </motion.div>
                )}

                {stage === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--ai-muted)] mb-1.5">
                            {t('booking.topicLabel')}
                          </label>
                          <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t('booking.topicPlaceholder')}
                            maxLength={500}
                            className="w-full px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)] text-[color:var(--ai-foreground)] focus:outline-none focus:border-[color:var(--ai-primary)] min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--ai-muted)] mb-1.5">
                            {t('booking.notesLabel')}
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('booking.notesPlaceholder')}
                            maxLength={2000}
                            className="w-full px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)] text-[color:var(--ai-foreground)] focus:outline-none focus:border-[color:var(--ai-primary)] min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[color:var(--ai-primary)]/5 to-transparent p-5">
                        <div className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">
                          {t('booking.estimatedPrice')}
                        </div>
                        <div className="text-3xl font-bold text-[color:var(--ai-foreground)] mt-2">
                          {formatMoney(
                            computeMeetingPrice(config.hourlyRateAmount, duration),
                            config.currency
                          )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[color:var(--ai-muted)]">{t('booking.durationMinutes', { minutes: duration })}</span>
                            <span className="font-medium">{duration} min</span>
                          </div>
                          {selectedSlot && (
                            <div className="flex justify-between">
                              <span className="text-[color:var(--ai-muted)]">When</span>
                              <span className="font-medium text-right">
                                {formatLongDate(new Date(selectedSlot.startAt))}
                                <br />
                                {formatTimeOnly(selectedSlot.startAt, userTimezone)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-[color:var(--ai-muted)]">{t('booking.timezoneLabel')}</span>
                            <span className="font-medium">{userTimezone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {error && (
                      <div className="mt-4 p-3 rounded-lg border border-[color:var(--ai-error,#ef4444)]/30 bg-[color:var(--ai-error,#ef4444)]/10 text-sm text-[color:var(--ai-foreground)]">
                        {error}
                      </div>
                    )}
                    <div className="mt-6 flex justify-between">
                      <AppButton variant="secondary" size="md" onPress={() => setStage('time')}>
                        {t('booking.back')}
                      </AppButton>
                      <AppButton
                        variant="primary"
                        size="lg"
                        onPress={submitBooking}
                        isLoading={submitting}
                        endContent={<FiArrowRight size={18} />}
                      >
                        {t('booking.confirm')}
                      </AppButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* "Texts are forever free" section — the heart of the offer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--ai-card-border)] bg-gradient-to-br from-[color:var(--ai-success,#10b981)]/5 via-[color:var(--ai-primary)]/5 to-transparent p-8 md:p-10">
            <div
              aria-hidden
              className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-[color:var(--ai-success,#10b981)]/20 to-transparent blur-3xl"
            />
            <div className="relative flex flex-col md:flex-row items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[color:var(--ai-success,#10b981)]/15 grid place-items-center flex-shrink-0">
                <FiMessageSquare size={26} className="text-[color:var(--ai-success,#10b981)]" />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[color:var(--ai-success,#10b981)]/15 text-[color:var(--ai-success,#10b981)] text-[11px] font-bold uppercase tracking-wider">
                  {t('landing.freeText.badge')}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-[color:var(--ai-foreground)]">
                  {t('landing.freeText.title')}
                </h3>
                <p className="mt-3 text-base text-[color:var(--ai-muted)] leading-relaxed">
                  {t('landing.freeText.description')}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[color:var(--ai-foreground)] text-center mb-8">
            {t('landing.howItWorks.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white grid place-items-center font-bold mb-4">
                  {i}
                </div>
                <div className="font-semibold text-[color:var(--ai-foreground)]">
                  {t(`landing.howItWorks.step${i}Title` as any)}
                </div>
                <div className="mt-1 text-sm text-[color:var(--ai-muted)]">
                  {t(`landing.howItWorks.step${i}Description` as any)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {config?.publicNote && (
          <div className="max-w-3xl mx-auto text-center text-sm text-[color:var(--ai-muted)] italic">
            {config.publicNote}
          </div>
        )}
      </div>
    </div>
  );
}
