'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from '@heroui/react';
import SelectItem from '@/components/ui/SelectItem';
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

// Funny progress steps for account creation
const CREATION_STEPS = [
  { emoji: '🧙‍♂️', text: 'Summoning the account wizard...' },
  { emoji: '🔮', text: 'Gazing into the crystal ball for a username...' },
  { emoji: '🏗️', text: 'Building a tiny digital house for the user...' },
  { emoji: '🔑', text: 'Forging the secret key in Mount Code...' },
  { emoji: '🤝', text: 'Convincing GitHub to open the gates...' },
  { emoji: '🚀', text: 'Launching the user into the code-verse...' },
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

      {accounts.length > 0 ? (
        <Table aria-label="GitHub accounts table">
          <TableHeader>
            <TableColumn>#</TableColumn>
            <TableColumn>ACCOUNT</TableColumn>
            <TableColumn>GITHUB USER</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>SUBSCRIPTION</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">{account.userPrincipalName}</span>
                    <button
                      onClick={() => copyToClipboard(account.userPrincipalName)}
                      className="text-[color:var(--ai-muted-foreground)] hover:text-[color:var(--ai-primary)] p-1"
                      title="Copy"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">{account.githubUsername}</span>
                </TableCell>
                <TableCell>
                  <Chip color={account.isActive ? 'success' : 'danger'} size="sm" variant="flat">
                    {account.isActive ? 'Active' : 'Disabled'}
                  </Chip>
                </TableCell>
                <TableCell>
                  {account.subscriptionId ? (
                    <Chip color="primary" size="sm" variant="flat">
                      Linked
                    </Chip>
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
                        isLoading={linkingId === account.id}
                        onPress={() => handleLinkSubscription(account.id)}
                        isDisabled={!selectedSubscription}
                      >
                        Link
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      color={account.isActive ? 'warning' : 'success'}
                      variant="flat"
                      isLoading={togglingId === account.id}
                      onPress={() => handleToggle(account.id, account.isActive)}
                    >
                      {account.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      isLoading={unlinkingId === account.id}
                      onPress={() => handleUnlink(account.id)}
                      title="Detach from this user (does not delete the Azure account)"
                    >
                      Unlink
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 bg-[color:var(--ai-card-bg)]/80 dark:bg-[color:var(--ai-card-border)]/50 rounded-xl border border-dashed border-primary-200 dark:border-[color:var(--ai-card-border)] backdrop-blur-sm">
          <svg className="mx-auto h-12 w-12 text-[color:var(--ai-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="mt-2 text-[color:var(--ai-muted-foreground)]">
            No GitHub accounts created yet
          </p>
          <p className="mt-1 text-sm text-[color:var(--ai-muted-foreground)]">
            Click &quot;Create Account&quot; to provision a new GitHub account for this user
          </p>
        </div>
      )}

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

      {/* Create Account Confirmation Modal */}
      <Modal
        isOpen={createConfirmOpen}
        onClose={() => setCreateConfirmOpen(false)}
        size="md"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => {
            const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
            const nextNumber = accounts.length + 1;
            const suffix = nextNumber > 1 ? String(nextNumber).padStart(2, '0') : '';
            const newAccount = `${baseUsername}${suffix}@studiai.ro`;
            const newGithub = `${baseUsername}${suffix}_metu`;

            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>✨</span> Create New GitHub Account
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-[color:var(--ai-foreground)]">
                    A brand-new account will be provisioned for <strong>{user.displayName || user.email}</strong>.
                  </p>
                  <div className="bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)] rounded-lg p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-[color:var(--ai-muted-foreground)]">Account #</span>
                      <code className="font-mono">{nextNumber}</code>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[color:var(--ai-muted-foreground)]">Email</span>
                      <code className="font-mono text-[color:var(--ai-primary)] truncate">{newAccount}</code>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[color:var(--ai-muted-foreground)]">GitHub username</span>
                      <code className="font-mono text-[color:var(--ai-primary)] truncate">{newGithub}</code>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                    💡 If you already created the account manually in Azure AD, use <strong>Link Existing</strong> instead to avoid duplicates.
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleCreate}
                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium"
                  >
                    Yes, Create Account
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      {/* Link Existing Account Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => {
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
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold">Link Existing Account</h3>
                  <p className="text-xs text-[color:var(--ai-muted-foreground)] font-normal">
                    Choose an Azure AD account on <code>studiai.ro</code> to attach to this user.
                    Subscription linking is optional and can be done later.
                  </p>
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      size="sm"
                      placeholder="Search by name, email, or GitHub username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      startContent={
                        <svg className="h-4 w-4 text-[color:var(--ai-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <Button size="sm" variant="flat" onPress={fetchAvailableUsers} isLoading={availableLoading}>
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {availableError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                      {availableError}
                    </div>
                  )}

                  {availableLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-[color:var(--ai-muted-foreground)]">
                      <div className="text-5xl mb-2">🔍</div>
                      <p>No accounts found</p>
                      {!showLinked && availableUsers.some((u) => u.alreadyLinked) && (
                        <p className="text-xs mt-1">Try toggling &quot;Show linked&quot; to see linked accounts.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {filtered.map((u) => (
                        <div
                          key={u.azureUserId}
                          className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${u.alreadyLinked
                            ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-70'
                            : 'bg-[color:var(--ai-card-bg)]/60 border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]'
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{u.displayName || u.mailNickname}</p>
                              {!u.accountEnabled && (
                                <Chip size="sm" color="danger" variant="flat">Disabled</Chip>
                              )}
                              {u.alreadyLinked && (
                                <Chip size="sm" color="warning" variant="flat">Already linked</Chip>
                              )}
                            </div>
                            <p className="text-xs font-mono text-[color:var(--ai-muted-foreground)] truncate">
                              {u.userPrincipalName}
                            </p>
                            <p className="text-xs text-[color:var(--ai-muted-foreground)] truncate">
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
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>Close</Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}
