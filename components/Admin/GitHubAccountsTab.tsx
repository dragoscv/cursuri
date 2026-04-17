'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Button,
  Chip,
  Spinner,
  Select,
  Input,
} from '@heroui/react';
import SelectItem from '@/components/ui/SelectItem';
import { AppModal, DataTable, type DataTableColumn } from '@/components/shared/ui';
import { firebaseAuth, firebaseApp } from '@/utils/firebase/firebase.config';
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import type { GitHubAccount } from '@/types/github-accounts';
import type { UserProfile } from '@/types';
import type { EnrichedSubscription } from '@/types/stripe';

interface GitHubAccountsTabProps {
  user: UserProfile;
  subscriptions?: EnrichedSubscription[];
}

interface AvailableAzureUser {
  azureUserId: string;
  userPrincipalName: string;
  displayName: string;
  mailNickname: string;
  accountEnabled: boolean;
  derivedGithubUsername: string;
  alreadyLinked: boolean;
  linkedToUserId?: string;
}

type CheckStatus = 'ok' | 'missing' | 'pending' | 'error' | 'skipped';

interface HealthCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
  repairable: boolean;
}

interface AccountHealth {
  accountId: string;
  githubUsername: string;
  userPrincipalName: string;
  checks: HealthCheck[];
  overall: 'ok' | 'needs_repair';
}

interface RepairStepResult {
  id: string;
  label: string;
  ran: boolean;
  status: CheckStatus;
  detail?: string;
}

// Funny progress steps for account creation
const CREATION_STEPS = [
  { emoji: '🧙‍♂️', text: 'Summoning the account wizard...' },
  { emoji: '🔮', text: 'Gazing into the crystal ball for a username...' },
  { emoji: '🏗️', text: 'Building a tiny digital house for the user...' },
  { emoji: '🔑', text: 'Forging the secret key in Mount Code...' },
  { emoji: '🤝', text: 'Convincing GitHub to open the gates...' },
  { emoji: '�', text: 'Inviting the octocat to studiai-students...' },
  { emoji: '�🚀', text: 'Launching the user into the code-verse...' },
  { emoji: '🎉', text: 'Sprinkling magic dust... almost there!' },
];

async function apiCall(
  url: string,
  method: string = 'GET',
  body?: Record<string, unknown>
): Promise<Response> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return fetch(url, options);
}

function CreationProgress({ currentStep, isDone, error }: { currentStep: number; isDone: boolean; error: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200/50 dark:border-indigo-800/30 p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
          {isDone ? '✨' : error ? '💥' : '⚡'}
          {isDone ? 'Account Created Successfully!' : error ? 'Oops! Something went wrong' : 'Creating Account...'}
        </h4>

        <div className="space-y-3">
          {CREATION_STEPS.map((step, index) => {
            const isActive = index === currentStep && !isDone && !error;
            const isCompleted = index < currentStep || isDone;
            const isPending = index > currentStep && !isDone;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-500 ${isActive
                  ? 'scale-[1.02] opacity-100'
                  : isCompleted
                    ? 'opacity-70 scale-100'
                    : 'opacity-30 scale-95'
                  }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${isCompleted
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : isActive
                      ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400/50 animate-pulse'
                      : 'bg-gray-200/50 dark:bg-gray-700/30 text-gray-400'
                    }`}
                >
                  {isCompleted ? '✓' : step.emoji}
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${isActive
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : isCompleted
                      ? 'text-green-700 dark:text-green-400 line-through'
                      : 'text-gray-400 dark:text-gray-600'
                    }`}
                >
                  {step.text}
                </span>
                {isActive && (
                  <Spinner size="sm" color="secondary" className="ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-200/50 dark:bg-gray-700/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${error
              ? 'bg-red-500'
              : isDone
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
              }`}
            style={{
              width: isDone ? '100%' : error ? `${((currentStep + 1) / CREATION_STEPS.length) * 100}%` : `${((currentStep + 0.5) / CREATION_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  const base = 'flex-none inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold';
  switch (status) {
    case 'ok':
      return <span className={`${base} bg-green-500/20 text-green-600 dark:text-green-400`}>✓</span>;
    case 'pending':
      return <span className={`${base} bg-amber-500/20 text-amber-600 dark:text-amber-400`}>…</span>;
    case 'missing':
      return <span className={`${base} bg-red-500/20 text-red-600 dark:text-red-400`}>✗</span>;
    case 'error':
      return <span className={`${base} bg-red-500/20 text-red-600 dark:text-red-400`}>!</span>;
    case 'skipped':
    default:
      return <span className={`${base} bg-gray-400/20 text-gray-500`}>–</span>;
  }
}

function StatusChip({ status }: { status: CheckStatus }) {
  const config: Record<CheckStatus, { color: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
    ok: { color: 'success', label: 'OK' },
    pending: { color: 'warning', label: 'Pending' },
    missing: { color: 'danger', label: 'Missing' },
    error: { color: 'danger', label: 'Error' },
    skipped: { color: 'default', label: 'Skipped' },
  };
  const { color, label } = config[status];
  return (
    <Chip color={color} size="sm" variant="flat">
      {label}
    </Chip>
  );
}

function OrgMembershipCell({
  account,
  retryingId,
  onRetry,
}: {
  account: GitHubAccount;
  retryingId: string | null;
  onRetry: () => void;
}) {
  const status = account.orgMembershipStatus;
  const isRetrying = retryingId === account.id;

  if (status === 'added') {
    return (
      <Chip color="success" size="sm" variant="flat" title="Member of studiai-students">
        ✓ In org
      </Chip>
    );
  }

  const label =
    status === 'pending'
      ? 'Pending'
      : status === 'failed'
        ? 'Failed'
        : status === 'skipped'
          ? 'Skipped'
          : 'Unknown';
  const color = status === 'pending' ? 'warning' : status === 'failed' ? 'danger' : 'default';

  return (
    <div className="flex items-center gap-1">
      <Chip
        color={color}
        size="sm"
        variant="flat"
        title={account.orgMembershipError || 'Not a member of the organization'}
      >
        {label}
      </Chip>
      <Button
        size="sm"
        variant="light"
        color="primary"
        isLoading={isRetrying}
        onPress={onRetry}
        title="Retry adding to studiai-students"
      >
        Retry
      </Button>
    </div>
  );
}

export default function GitHubAccountsTab({ user, subscriptions }: GitHubAccountsTabProps) {
  const [accounts, setAccounts] = useState<GitHubAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Link existing account modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableAzureUser[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkingAzureId, setLinkingAzureId] = useState<string | null>(null);
  const [showLinked, setShowLinked] = useState(false);

  // Create confirmation modal state
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false);

  // Unlink confirmation
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  // Retry org membership
  const [retryingOrgId, setRetryingOrgId] = useState<string | null>(null);

  // Health modal
  const [healthOpen, setHealthOpen] = useState(false);
  const [healthAccount, setHealthAccount] = useState<GitHubAccount | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthData, setHealthData] = useState<AccountHealth | null>(null);
  const [repairRunning, setRepairRunning] = useState(false);
  const [repairSteps, setRepairSteps] = useState<RepairStepResult[] | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Creation progress state
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(0);
  const [creationDone, setCreationDone] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall(`/api/admin/github-accounts?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        setError(data.error || 'Failed to fetch accounts');
      }
    } catch (err) {
      setError('Network error fetching accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  const handleCreate = async () => {
    // Close confirmation modal and start progress
    setCreateConfirmOpen(false);
    setIsCreating(true);
    setCreationStep(0);
    setCreationDone(false);
    setCreationError(null);
    setError(null);
    setSuccessMessage(null);

    // Animate steps with random intervals for a natural feel
    let step = 0;
    stepIntervalRef.current = setInterval(() => {
      step++;
      if (step < CREATION_STEPS.length - 1) {
        setCreationStep(step);
      }
    }, 1200 + Math.random() * 800);

    try {
      const res = await apiCall('/api/admin/github-accounts', 'POST', {
        userId: user.id,
        userEmail: user.email,
        displayName: user.displayName,
      });
      const data = await res.json();

      // Clear interval and jump to completion
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);

      if (data.success) {
        // Animate through remaining steps quickly
        for (let i = step + 1; i < CREATION_STEPS.length; i++) {
          await new Promise((r) => setTimeout(r, 200));
          setCreationStep(i);
        }
        await new Promise((r) => setTimeout(r, 300));
        setCreationDone(true);
        setSuccessMessage(
          `Account created: ${data.account.githubUsername}`
        );
        await fetchAccounts();
      } else {
        setCreationError(data.error || 'Failed to create account');
      }
    } catch (err) {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setCreationError('Network error creating account');
      console.error(err);
    }
  };

  const handleCloseProgress = () => {
    setIsCreating(false);
    setCreationStep(0);
    setCreationDone(false);
    setCreationError(null);
  };

  const handleToggle = async (accountId: string, currentActive: boolean) => {
    setTogglingId(accountId);
    setError(null);
    try {
      const res = await apiCall('/api/admin/github-accounts', 'PATCH', {
        accountId,
        userId: user.id,
        enabled: !currentActive,
      });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === accountId ? { ...a, isActive: !currentActive } : a))
        );
      } else {
        setError(data.error || 'Failed to toggle account');
      }
    } catch (err) {
      setError('Network error toggling account');
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleLinkSubscription = async (accountId: string) => {
    if (!selectedSubscription) return;
    setLinkingId(accountId);
    setError(null);
    try {
      const res = await apiCall('/api/admin/github-accounts', 'PUT', {
        accountId,
        userId: user.id,
        subscriptionId: selectedSubscription,
      });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === accountId ? { ...a, subscriptionId: selectedSubscription } : a
          )
        );
        setSelectedSubscription('');
        setSuccessMessage('Subscription linked successfully');
      } else {
        setError(data.error || 'Failed to link subscription');
      }
    } catch (err) {
      setError('Network error linking subscription');
      console.error(err);
    } finally {
      setLinkingId(null);
    }
  };

  const handlePurchaseSubscription = async () => {
    setPurchaseLoading(true);
    try {
      const payments = stripePayments(firebaseApp);
      // Use monthly price ID from the subscription product
      const session = await createCheckoutSession(payments, {
        price: 'price_1SO07cLG0nGypmDBXjef95ut',
        allow_promotion_codes: true,
        mode: 'subscription',
        success_url: `${window.location.origin}/admin?tab=users&githubCreated=true&userId=${user.id}`,
        cancel_url: `${window.location.origin}/admin?tab=users&userId=${user.id}`,
      });
      window.location.assign(session.url);
    } catch (err) {
      setError('Failed to start subscription checkout');
      console.error(err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const fetchAvailableUsers = useCallback(async () => {
    setAvailableLoading(true);
    setAvailableError(null);
    try {
      const res = await apiCall('/api/admin/github-accounts/available');
      const data = await res.json();
      if (data.success) {
        setAvailableUsers(data.users);
      } else {
        setAvailableError(data.error || 'Failed to load available accounts');
      }
    } catch (err) {
      setAvailableError('Network error loading available accounts');
      console.error(err);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  const handleOpenLinkModal = () => {
    setLinkModalOpen(true);
    setSearchQuery('');
    setShowLinked(false);
    fetchAvailableUsers();
  };

  const handleLinkExisting = async (azureUserId: string) => {
    setLinkingAzureId(azureUserId);
    setError(null);
    try {
      const res = await apiCall('/api/admin/github-accounts', 'POST', {
        mode: 'link',
        userId: user.id,
        azureUserId,
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Linked account: ${data.account.githubUsername}`);
        setLinkModalOpen(false);
        await fetchAccounts();
      } else {
        setAvailableError(data.error || 'Failed to link account');
      }
    } catch (err) {
      setAvailableError('Network error linking account');
      console.error(err);
    } finally {
      setLinkingAzureId(null);
    }
  };

  const handleUnlink = async (accountId: string) => {
    if (!confirm('Detach this account from the user? The Azure account will NOT be deleted and can be re-linked later.')) {
      return;
    }
    setUnlinkingId(accountId);
    setError(null);
    try {
      const res = await apiCall('/api/admin/github-accounts', 'DELETE', {
        accountId,
        userId: user.id,
      });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== accountId));
        setSuccessMessage('Account unlinked');
      } else {
        setError(data.error || 'Failed to unlink account');
      }
    } catch (err) {
      setError('Network error unlinking account');
      console.error(err);
    } finally {
      setUnlinkingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Copied to clipboard!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleRetryOrg = async (accountId: string) => {
    setRetryingOrgId(accountId);
    setError(null);
    try {
      const res = await apiCall('/api/admin/github-accounts/add-to-org', 'POST', {
        userId: user.id,
        accountId,
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Added ${data.githubUsername || 'user'} to the organization`);
      } else if (data.status === 'pending') {
        setError('GitHub does not see the user yet — SCIM may still be syncing. Try again in a minute.');
      } else {
        setError(data.error || 'Failed to add user to organization');
      }
      await fetchAccounts();
    } catch (err) {
      setError('Network error adding user to organization');
      console.error(err);
    } finally {
      setRetryingOrgId(null);
    }
  };

  const runHealthCheck = useCallback(
    async (accountId: string) => {
      setHealthLoading(true);
      setHealthError(null);
      try {
        const res = await apiCall('/api/admin/github-accounts/health', 'POST', {
          userId: user.id,
          accountId,
        });
        const data = await res.json();
        if (data.success) {
          setHealthData(data.health);
        } else {
          setHealthError(data.error || 'Failed to run health check');
        }
      } catch (err) {
        setHealthError('Network error running health check');
        console.error(err);
      } finally {
        setHealthLoading(false);
      }
    },
    [user.id]
  );

  const handleOpenHealth = (account: GitHubAccount) => {
    setHealthAccount(account);
    setHealthData(null);
    setRepairSteps(null);
    setHealthError(null);
    setHealthOpen(true);
    runHealthCheck(account.id);
  };

  const handleRepair = async () => {
    if (!healthAccount) return;
    setRepairRunning(true);
    setHealthError(null);
    setRepairSteps(null);
    try {
      const res = await apiCall('/api/admin/github-accounts/repair', 'POST', {
        userId: user.id,
        accountId: healthAccount.id,
      });
      const data = await res.json();
      if (data.success) {
        setRepairSteps(data.steps || []);
        setHealthData(data.health || null);
        await fetchAccounts();
      } else {
        setHealthError(data.error || 'Repair failed');
      }
    } catch (err) {
      setHealthError('Network error running repair');
      console.error(err);
    } finally {
      setRepairRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>🐙</span> GitHub Accounts
          </h3>
          <p className="text-sm text-[color:var(--ai-muted-foreground)] mt-0.5">
            Provision new accounts or attach existing ones from Azure AD.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            size="sm"
            variant="bordered"
            onPress={handleOpenLinkModal}
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            }
          >
            Link Existing
          </Button>
          <Button
            color="secondary"
            size="sm"
            variant="flat"
            onPress={handlePurchaseSubscription}
            isLoading={purchaseLoading}
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            }
          >
            Purchase Subscription
          </Button>
          <Button
            color="primary"
            size="sm"
            onPress={() => setCreateConfirmOpen(true)}
            isDisabled={isCreating && !creationDone && !creationError}
            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium"
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
          >
            Create New {accounts.length > 0 ? `(#${accounts.length + 1})` : ''}
          </Button>
        </div>
      </div>

      {/* Info box about email derivation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <p className="text-blue-800 dark:text-blue-300">
          <strong>Username derivation:</strong> From email <code>{user.email}</code> →
          Account: <code>{user.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase()}@studiai.ro</code> →
          GitHub: <code>{user.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase()}_metu</code>
        </p>
        <p className="text-blue-700 dark:text-blue-400 mt-1">
          Next accounts will get suffix 02, 03, etc.
        </p>
      </div>

      {/* Funny creation progress */}
      {isCreating && (
        <div className="relative">
          <CreationProgress
            currentStep={creationStep}
            isDone={creationDone}
            error={creationError}
          />
          {(creationDone || creationError) && (
            <Button
              size="sm"
              variant="light"
              onPress={handleCloseProgress}
              className="absolute top-2 right-2"
            >
              ✕
            </Button>
          )}
        </div>
      )}

      {error && !isCreating && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {successMessage && !isCreating && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}

      <DataTable<GitHubAccount>
        data={accounts}
        rowKey={(a) => a.id}
        columns={[
          {
            key: 'num',
            header: '#',
            width: '56px',
            align: 'center',
            cell: (a) => (
              <span className="inline-grid place-items-center w-7 h-7 rounded-md bg-[color:var(--ai-card-border)]/50 text-[color:var(--ai-muted)] text-xs font-semibold">
                {a.accountNumber}
              </span>
            ),
            sortAccessor: (a) => a.accountNumber,
          },
          {
            key: 'account',
            header: 'Account',
            cell: (a) => (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-mono truncate">{a.userPrincipalName}</span>
                <button
                  onClick={() => copyToClipboard(a.userPrincipalName)}
                  className="opacity-0 group-hover:opacity-100 text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] p-1 transition"
                  title="Copy"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ),
            sortAccessor: (a) => a.userPrincipalName,
          },
          {
            key: 'github',
            header: 'GitHub user',
            responsiveFrom: 'md',
            cell: (a) => <span className="text-sm font-mono">{a.githubUsername}</span>,
            sortAccessor: (a) => a.githubUsername,
          },
          {
            key: 'status',
            header: 'Status',
            width: '100px',
            cell: (a) => (
              <Chip color={a.isActive ? 'success' : 'danger'} size="sm" variant="flat">
                {a.isActive ? 'Active' : 'Disabled'}
              </Chip>
            ),
            sortAccessor: (a) => (a.isActive ? 1 : 0),
          },
          {
            key: 'org',
            header: 'Org',
            responsiveFrom: 'lg',
            cell: (a) => (
              <OrgMembershipCell
                account={a}
                retryingId={retryingOrgId}
                onRetry={() => handleRetryOrg(a.id)}
              />
            ),
          },
          {
            key: 'sub',
            header: 'Subscription',
            responsiveFrom: 'lg',
            cell: (a) =>
              a.subscriptionId ? (
                <Chip color="primary" size="sm" variant="flat">Linked</Chip>
              ) : (
                <div className="flex items-center gap-1">
                  <Select
                    size="sm"
                    placeholder="Link..."
                    className="w-32"
                    value={selectedSubscription}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedSubscription(e.target.value)
                    }
                  >
                    {(subscriptions || []).map((sub) => (
                      <SelectItem key={sub.id} value={sub.id} textValue={sub.id}>
                        {sub.product?.name || sub.id.slice(-8)}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    isLoading={linkingId === a.id}
                    onPress={() => handleLinkSubscription(a.id)}
                    isDisabled={!selectedSubscription}
                  >
                    Link
                  </Button>
                </div>
              ),
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            cell: (a) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  color={a.isActive ? 'warning' : 'success'}
                  variant="flat"
                  isLoading={togglingId === a.id}
                  onPress={() => handleToggle(a.id, a.isActive)}
                >
                  {a.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  variant="light"
                  onPress={() => handleOpenHealth(a)}
                  title="Check provisioning health and fix anything missing"
                >
                  🩺 Health
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  isLoading={unlinkingId === a.id}
                  onPress={() => handleUnlink(a.id)}
                  title="Detach from this user (does not delete the Azure account)"
                >
                  Unlink
                </Button>
              </div>
            ),
          },
        ]}
        emptyState={
          <div className="text-center py-4">
            <svg className="mx-auto h-12 w-12 text-[color:var(--ai-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="mt-2 text-[color:var(--ai-foreground)] font-medium">
              No GitHub accounts created yet
            </p>
            <p className="mt-1 text-sm text-[color:var(--ai-muted)]">
              Click <strong>Create New</strong> to provision a new GitHub account for this user
            </p>
          </div>
        }
      />

      {/* Quick copy section for all accounts */}
      {accounts.length > 0 && (
        <div className="bg-[color:var(--ai-card-bg)]/80 dark:bg-[color:var(--ai-card-border)]/50 p-4 rounded-xl backdrop-blur-sm space-y-3">
          <h4 className="font-medium text-sm">Quick Info (click to copy all)</h4>
          {accounts.map((account) => (
            <div
              key={account.id}
              className="text-sm font-mono bg-[color:var(--ai-background)] dark:bg-[color:var(--ai-background)] p-3 rounded-lg cursor-pointer hover:ring-2 hover:ring-[color:var(--ai-primary)]"
              onClick={() =>
                copyToClipboard(
                  `User GitHub: ${account.githubUsername}\nUser Cont Microsoft: ${account.userPrincipalName}\nParola: ${account.defaultPassword} (o să îți ceară să o schimbi)\nDupă ce scrii pe GitHub username-ul nu trebuie să introduci parola, parola o cere doar la contul de Microsoft\n\nSă descarci VS Code Insiders, cu acel Insiders, nu cea normală`
                )
              }
            >
              <p>User GitHub: <strong>{account.githubUsername}</strong></p>
              <p>User Cont Microsoft: <strong>{account.userPrincipalName}</strong></p>
              <p>Parola: <strong>{account.defaultPassword}</strong> (o să îți ceară să o schimbi)</p>
              <p className="text-[color:var(--ai-muted-foreground)] mt-1">
                După ce scrii pe GitHub username-ul nu trebuie să introduci parola, parola o cere doar la contul de Microsoft
              </p>
              <p className="text-[color:var(--ai-muted-foreground)] mt-1">
                Să descarci VS Code Insiders, cu acel Insiders, nu cea normală
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Health Modal */}
      <AppModal
        isOpen={healthOpen}
        onClose={() => setHealthOpen(false)}
        size="2xl"
        tone={
          healthData?.overall === 'ok'
            ? 'success'
            : healthData?.overall === 'needs_repair'
              ? 'warning'
              : 'primary'
        }
        icon={<span className="text-xl">🩺</span>}
        title="Provisioning Health"
        subtitle={
          healthAccount && (
            <span className="font-mono">
              {healthAccount.userPrincipalName} · @{healthAccount.githubUsername}
            </span>
          )
        }
        footer={
          <>
            <Button variant="light" onPress={() => setHealthOpen(false)}>
              Close
            </Button>
            <Button
              variant="flat"
              onPress={() => healthAccount && runHealthCheck(healthAccount.id)}
              isDisabled={healthLoading || repairRunning}
            >
              Re-check
            </Button>
            <Button
              color="primary"
              onPress={handleRepair}
              isLoading={repairRunning}
              isDisabled={!healthData || healthData.overall === 'ok'}
              className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium"
            >
              {healthData?.overall === 'ok' ? 'All good ✓' : '🔧 Repair missing steps'}
            </Button>
          </>
        }
      >
        {healthError && (
          <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
            {healthError}
          </div>
        )}

        {healthLoading && !healthData ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="sm" />
            <span className="ml-2 text-sm text-[color:var(--ai-muted)]">Running checks...</span>
          </div>
        ) : healthData ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Chip
                color={healthData.overall === 'ok' ? 'success' : 'warning'}
                size="sm"
                variant="flat"
              >
                {healthData.overall === 'ok' ? '✓ All good' : '⚠ Needs repair'}
              </Chip>
              {healthLoading && <Spinner size="sm" />}
            </div>
            <ul className="space-y-2">
              {healthData.checks.map((check) => (
                <li
                  key={check.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)]/50"
                >
                  <StatusIcon status={check.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[color:var(--ai-foreground)]">
                        {check.label}
                      </span>
                      <StatusChip status={check.status} />
                    </div>
                    {check.detail && (
                      <p className="text-xs text-[color:var(--ai-muted)] mt-1 break-words">
                        {check.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {repairSteps && repairSteps.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[color:var(--ai-card-border)]">
            <p className="text-[10px] font-semibold text-[color:var(--ai-muted)] mb-2 uppercase tracking-[0.14em]">
              Last repair run
            </p>
            <ul className="space-y-1.5">
              {repairSteps.map((step) => (
                <li key={step.id} className="flex items-start gap-2 text-sm">
                  <StatusIcon status={step.status} />
                  <div className="flex-1">
                    <span className="font-medium text-[color:var(--ai-foreground)]">
                      {step.label}
                    </span>
                    {step.detail && (
                      <span className="text-xs text-[color:var(--ai-muted)] ml-2">
                        — {step.detail}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AppModal>

      {/* Create Account Confirmation Modal */}
      {(() => {
        const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
        const nextNumber = accounts.length + 1;
        const suffix = nextNumber > 1 ? String(nextNumber).padStart(2, '0') : '';
        const newAccount = `${baseUsername}${suffix}@studiai.ro`;
        const newGithub = `${baseUsername}${suffix}_metu`;
        return (
          <AppModal
            isOpen={createConfirmOpen}
            onClose={() => setCreateConfirmOpen(false)}
            size="md"
            tone="primary"
            icon={<span className="text-xl">✨</span>}
            title="Create new GitHub account"
            subtitle={`A brand-new account will be provisioned for ${user.displayName || user.email}`}
            footer={
              <>
                <Button variant="light" onPress={() => setCreateConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreate}
                  className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium"
                >
                  Yes, create account
                </Button>
              </>
            }
          >
            <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)]/60 p-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[color:var(--ai-muted)]">Account #</span>
                <code className="font-mono text-[color:var(--ai-foreground)]">{nextNumber}</code>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[color:var(--ai-muted)]">Email</span>
                <code className="font-mono text-[color:var(--ai-primary)] truncate">{newAccount}</code>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[color:var(--ai-muted)]">GitHub username</span>
                <code className="font-mono text-[color:var(--ai-primary)] truncate">{newGithub}</code>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
              💡 If you already created the account manually in Azure AD, use <strong>Link Existing</strong> instead to avoid duplicates.
            </div>
          </AppModal>
        );
      })()}

      {/* Link Existing Account Modal */}
      {(() => {
        const filtered = availableUsers.filter((u) => {
          if (!showLinked && u.alreadyLinked) return false;
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            u.userPrincipalName.toLowerCase().includes(q) ||
            u.displayName?.toLowerCase().includes(q) ||
            u.derivedGithubUsername.toLowerCase().includes(q)
          );
        });
        return (
          <AppModal
            isOpen={linkModalOpen}
            onClose={() => setLinkModalOpen(false)}
            size="3xl"
            tone="primary"
            icon={<span className="text-xl">🔗</span>}
            title="Link existing account"
            subtitle={
              <>
                Choose an Azure AD account on <code>studiai.ro</code> to attach to this user.
              </>
            }
            footer={
              <Button variant="light" onPress={() => setLinkModalOpen(false)}>
                Close
              </Button>
            }
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                size="sm"
                placeholder="Search by name, email, or GitHub username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={
                  <svg className="h-4 w-4 text-[color:var(--ai-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={showLinked ? 'solid' : 'flat'}
                  color={showLinked ? 'primary' : 'default'}
                  onPress={() => setShowLinked((v) => !v)}
                >
                  {showLinked ? 'Showing all' : 'Show linked'}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={fetchAvailableUsers}
                  isLoading={availableLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {availableError && (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                {availableError}
              </div>
            )}

            {availableLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" color="primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-[color:var(--ai-muted)]">
                <div className="text-5xl mb-2">🔍</div>
                <p>No accounts found</p>
                {!showLinked && availableUsers.some((u) => u.alreadyLinked) && (
                  <p className="text-xs mt-1">
                    Try toggling <strong>Show linked</strong> to see linked accounts.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {filtered.map((u) => (
                  <div
                    key={u.azureUserId}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${u.alreadyLinked
                      ? 'bg-[color:var(--ai-card-border)]/30 border-[color:var(--ai-card-border)] opacity-70'
                      : 'bg-[color:var(--ai-background)]/50 border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 hover:bg-[color:var(--ai-primary)]/[0.04]'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate text-[color:var(--ai-foreground)]">
                          {u.displayName || u.mailNickname}
                        </p>
                        {!u.accountEnabled && (
                          <Chip size="sm" color="danger" variant="flat">Disabled</Chip>
                        )}
                        {u.alreadyLinked && (
                          <Chip size="sm" color="warning" variant="flat">Already linked</Chip>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[color:var(--ai-muted)] truncate">
                        {u.userPrincipalName}
                      </p>
                      <p className="text-xs text-[color:var(--ai-muted)] truncate">
                        GitHub: <span className="font-mono">{u.derivedGithubUsername}</span>
                        {u.alreadyLinked && u.linkedToUserId && (
                          <span> · linked to user <code>{u.linkedToUserId.slice(0, 8)}…</code></span>
                        )}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isDisabled={u.alreadyLinked}
                      isLoading={linkingAzureId === u.azureUserId}
                      onPress={() => handleLinkExisting(u.azureUserId)}
                    >
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AppModal>
        );
      })()}
    </div>
  );
}
