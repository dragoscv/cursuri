'use client';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Chip, Spinner } from '@heroui/react';
import { createCheckoutSession } from 'firewand';

import { AppContext } from '@/components/AppContext';
import type { AppContextProps } from '@/types';
import type { EnrichedSubscription } from '@/types/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from 'firebase/firestore';
import { stripePayments } from '@/utils/firebase/stripe';
import { GradientCard, MetricCard, SectionShell } from '@/components/user-shell';
import { AppButton } from '@/components/shared/ui';
import { useToast } from '@/components/Toast/ToastContext';
import CopilotPerksCard from '@/components/shared/CopilotPerksCard';

interface GitHubAccountDoc {
  id: string;
  accountNumber: number;
  githubUsername: string;
  userPrincipalName: string;
  defaultPassword: string;
  isActive: boolean;
  subscriptionId?: string;
}

const GITHUB_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_GITHUB_PRICE_ID || '';

function GitHubMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function formatDate(value?: string | null, locale = 'en'): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(value?: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function GitHubAccountsPage() {
  const t = useTranslations('profile.github');
  const ctx = useContext(AppContext) as AppContextProps;
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState<GitHubAccountDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const subscriptions: EnrichedSubscription[] = ctx?.subscriptions || [];
  const user = ctx?.user;

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, `users/${user.uid}/githubAccounts`),
        orderBy('accountNumber', 'asc')
      );
      const snap = await getDocs(q);
      setAccounts(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GitHubAccountDoc, 'id'>) }))
      );
    } catch (err) {
      console.error('Failed to load GitHub accounts', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.isActive).length;
    return { total, active, suspended: total - active };
  }, [accounts]);

  const subById = useMemo(() => {
    const map = new Map<string, EnrichedSubscription>();
    for (const s of subscriptions) map.set(s.id, s);
    return map;
  }, [subscriptions]);

  const handlePurchase = async () => {
    if (!GITHUB_PRICE_ID) {
      showToast({
        type: 'error',
        message:
          'GitHub subscription is not configured. Please contact support (NEXT_PUBLIC_STRIPE_GITHUB_PRICE_ID is missing).',
        duration: 6000,
      });
      return;
    }
    setPurchasing(true);
    try {
      const payments = stripePayments(firebaseApp);
      const session = await createCheckoutSession(payments, {
        price: GITHUB_PRICE_ID,
        allow_promotion_codes: true,
        mode: 'subscription',
        success_url: `${window.location.origin}/profile/github?status=success`,
        cancel_url: `${window.location.origin}/profile/github?status=cancel`,
      });
      window.location.assign(session.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start checkout.';
      console.error('Failed to start checkout', err);
      showToast({
        type: 'error',
        message,
        duration: 5000,
      });
      setPurchasing(false);
    }
  };

  const copy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      showToast({ type: 'success', message: t('account.copied'), duration: 1500 });
      setTimeout(() => setCopiedField((f) => (f === fieldKey ? null : f)), 1500);
    } catch {
      // ignore
    }
  };

  const copyAll = (account: GitHubAccountDoc) => {
    const text = [
      `${t('account.githubUser')}: ${account.githubUsername}`,
      `${t('account.microsoftUser')}: ${account.userPrincipalName}`,
      `${t('account.password')}: ${account.defaultPassword}`,
    ].join('\n');
    copy(text, `all-${account.id}`);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <GradientCard className="p-0 overflow-hidden" flush>
        <div className="relative grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-8 p-6 md:p-8 relative">
            <div
              aria-hidden
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--ai-primary) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--ai-secondary) 18%, transparent) 0%, transparent 55%)',
              }}
            />
            <div className="relative flex items-start gap-4">
              <div className="grid place-items-center w-12 h-12 rounded-2xl bg-[color:var(--ai-foreground)]/8 text-[color:var(--ai-foreground)]">
                <GitHubMark className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">
                  {t('pageTitle')}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ai-foreground)]">
                  {t('pageTitle')}
                </h1>
                <p className="mt-2 text-sm md:text-base text-[color:var(--ai-muted)] max-w-xl">
                  {t('pageSubtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 relative border-t md:border-t-0 md:border-l border-[color:var(--ai-card-border)] p-6 md:p-8 bg-gradient-to-br from-[color:var(--ai-primary)]/5 to-transparent">
            <p className="text-sm font-semibold text-[color:var(--ai-foreground)]">
              {t('buy.title')}
            </p>
            <p className="mt-1 text-xs text-[color:var(--ai-muted)]">
              {t('buy.description')}
            </p>
            <AppButton
              variant="primary"
              size="md"
              fullWidth
              className="mt-4"
              isLoading={purchasing}
              loadingText={t('buy.loading')}
              onPress={handlePurchase}
              startContent={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            >
              {t('buy.cta')}
            </AppButton>
          </div>
        </div>
      </GradientCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <MetricCard label={t('stats.total')} value={stats.total} tone="primary" />
        <MetricCard label={t('stats.active')} value={stats.active} tone="success" />
        <MetricCard label={t('stats.suspended')} value={stats.suspended} tone="warning" />
      </div>

      {/* Copilot setup guide - lesson + VS Code Insiders */}
      <CopilotPerksCard variant="setup" />

      {/* Accounts list */}
      <SectionShell title={t('pageTitle')} eyebrow={t('stats.total')}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" color="primary" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState onPurchase={handlePurchase} purchasing={purchasing} t={t} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((account, idx) => (
              <AccountCard
                key={account.id}
                account={account}
                subscription={account.subscriptionId ? subById.get(account.subscriptionId) : undefined}
                index={idx}
                copiedField={copiedField}
                onCopy={copy}
                onCopyAll={copyAll}
                t={t}
              />
            ))}
          </div>
        )}
      </SectionShell>
    </div>
  );
}

interface AccountCardProps {
  account: GitHubAccountDoc;
  subscription?: EnrichedSubscription;
  index: number;
  copiedField: string | null;
  onCopy: (text: string, key: string) => void;
  onCopyAll: (account: GitHubAccountDoc) => void;
  t: ReturnType<typeof useTranslations<'profile.github'>>;
}

function AccountCard({
  account,
  subscription,
  index,
  copiedField,
  onCopy,
  onCopyAll,
  t,
}: AccountCardProps) {
  const isActive = account.isActive;
  const periodEnd = subscription?.current_period_end;
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end;
  const days = daysUntil(periodEnd);

  let statusBadge: { color: 'success' | 'warning' | 'danger' | 'default'; label: string } = {
    color: isActive ? 'success' : 'danger',
    label: isActive ? t('account.active') : t('account.suspended'),
  };
  if (isActive && days !== null && days <= 7) {
    statusBadge = { color: 'warning', label: `${days}d` };
  }

  const subscriptionLine = (() => {
    if (!subscription) return t('account.noSubscription');
    if (cancelAtPeriodEnd) return t('account.cancelsOn', { date: formatDate(periodEnd) });
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      return t('account.renewsOn', { date: formatDate(periodEnd) });
    }
    return t('account.endsOn', { date: formatDate(periodEnd) });
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
      className="relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/85 backdrop-blur-xl shadow-sm"
    >
      {/* Status accent bar */}
      <div
        aria-hidden
        className={[
          'absolute inset-y-0 left-0 w-1',
          isActive
            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
            : 'bg-gradient-to-b from-rose-400 to-rose-600',
        ].join(' ')}
      />

      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-[color:var(--ai-foreground)]/8 text-[color:var(--ai-foreground)] shrink-0">
              <GitHubMark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">
                {t('account.label', { n: account.accountNumber })}
              </p>
              <p className="text-sm font-semibold text-[color:var(--ai-foreground)] truncate">
                {account.githubUsername}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip color={statusBadge.color} variant="flat" size="sm" className="font-medium">
              {isActive ? '● ' : '○ '}
              {isActive ? t('account.active') : t('account.suspended')}
            </Chip>
            <AppButton
              variant="flat"
              color="primary"
              size="sm"
              onPress={() => onCopyAll(account)}
              startContent={<CopyIcon className="w-3.5 h-3.5" />}
            >
              {copiedField === `all-${account.id}` ? t('account.copied') : t('account.copyAll')}
            </AppButton>
          </div>
        </div>

        {/* Subscription line */}
        <div className="mt-3 flex items-center gap-2 text-xs text-[color:var(--ai-muted)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <path d="M3 10h18" strokeLinecap="round" />
          </svg>
          <span className={cancelAtPeriodEnd ? 'text-amber-500 font-medium' : ''}>
            {subscriptionLine}
          </span>
          {days !== null && days <= 7 && days >= 0 && (
            <Chip size="sm" color="warning" variant="flat" className="h-5 text-[10px]">
              {days}d
            </Chip>
          )}
        </div>

        {/* Credentials grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <CredentialField
            label={t('account.githubUser')}
            value={account.githubUsername}
            fieldKey={`gh-${account.id}`}
            copiedField={copiedField}
            onCopy={onCopy}
            tone="primary"
            mono
          />
          <CredentialField
            label={t('account.microsoftUser')}
            value={account.userPrincipalName}
            fieldKey={`ms-${account.id}`}
            copiedField={copiedField}
            onCopy={onCopy}
            tone="primary"
            mono
          />
          <CredentialField
            label={t('account.password')}
            value={account.defaultPassword}
            fieldKey={`pw-${account.id}`}
            copiedField={copiedField}
            onCopy={onCopy}
            tone="default"
            mono
            hint={t('account.passwordHint')}
          />
        </div>

        {/* Hints */}
        <ul className="mt-5 pt-4 border-t border-[color:var(--ai-card-border)]/60 space-y-1.5 text-xs text-[color:var(--ai-muted)]">
          {(t.raw('account.hints') as string[]).map((hint, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 w-1 h-1 rounded-full bg-[color:var(--ai-primary)] shrink-0" />
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

interface CredentialFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, key: string) => void;
  tone?: 'primary' | 'default';
  mono?: boolean;
  hint?: string;
}

function CredentialField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  tone = 'default',
  mono,
  hint,
}: CredentialFieldProps) {
  const isCopied = copiedField === fieldKey;
  return (
    <div className="group relative rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)]/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">
        {label}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <code
          className={[
            'truncate text-sm',
            mono ? 'font-mono' : '',
            tone === 'primary'
              ? 'text-[color:var(--ai-primary)]'
              : 'text-[color:var(--ai-foreground)]',
          ].join(' ')}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={() => onCopy(value, fieldKey)}
          className="shrink-0 p-1.5 rounded-lg text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/10 transition-colors"
          aria-label={`Copy ${label}`}
        >
          {isCopied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-emerald-500">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>
      </div>
      {hint && (
        <p className="mt-1.5 text-[10px] text-[color:var(--ai-muted)] italic">{hint}</p>
      )}
    </div>
  );
}

interface EmptyStateProps {
  onPurchase: () => void;
  purchasing: boolean;
  t: ReturnType<typeof useTranslations<'profile.github'>>;
}

function EmptyState({ onPurchase, purchasing, t }: EmptyStateProps) {
  return (
    <div className="text-center py-10 px-6">
      <div className="mx-auto w-16 h-16 grid place-items-center rounded-2xl bg-[color:var(--ai-foreground)]/6 text-[color:var(--ai-foreground)]/70">
        <GitHubMark className="w-8 h-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[color:var(--ai-foreground)]">
        {t('empty.title')}
      </h3>
      <p className="mt-1 text-sm text-[color:var(--ai-muted)] max-w-md mx-auto">
        {t('empty.description')}
      </p>
      <AppButton
        variant="primary"
        size="lg"
        className="mt-6"
        isLoading={purchasing}
        loadingText={t('buy.loading')}
        onPress={onPurchase}
      >
        {t('empty.cta')}
      </AppButton>
    </div>
  );
}
