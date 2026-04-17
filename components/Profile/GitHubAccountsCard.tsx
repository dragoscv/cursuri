'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Card, CardBody, Chip, Spinner } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { firebaseApp } from '@/utils/firebase/firebase.config';

interface GitHubAccountDisplay {
  id: string;
  githubUsername: string;
  userPrincipalName: string;
  defaultPassword: string;
  isActive: boolean;
  accountNumber: number;
}

export default function GitHubAccountsCard() {
  const context = useContext(AppContext) as AppContextProps;
  const [accounts, setAccounts] = useState<GitHubAccountDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const { user } = context;

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, `users/${user.uid}/githubAccounts`),
        orderBy('accountNumber', 'asc')
      );
      const snapshot = await getDocs(q);
      const accts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GitHubAccountDisplay[];
      setAccounts(accts);
    } catch (error) {
      console.error('Error fetching GitHub accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const copyAll = async (account: GitHubAccountDisplay) => {
    const text = `User GitHub: ${account.githubUsername}
User Cont Microsoft: ${account.userPrincipalName}
Parola: ${account.defaultPassword} (o să îți ceară să o schimbi)
După ce scrii pe GitHub username-ul nu trebuie să introduci parola, parola o cere doar la contul de Microsoft

Să descarci VS Code Insiders, cu acel Insiders, nu cea normală`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(account.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard not available
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card className="mb-6">
        <CardBody className="flex justify-center items-center h-24">
          <Spinner size="sm" />
        </CardBody>
      </Card>
    );
  }

  if (accounts.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-4">
        Conturile tale GitHub
      </h2>
      <div className="space-y-4">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className="border border-[color:var(--ai-card-border)] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            isPressable
            onPress={() => copyAll(account)}
          >
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-[color:var(--ai-foreground)]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="font-semibold text-[color:var(--ai-foreground)]">
                    Account #{account.accountNumber}
                  </span>
                  <Chip
                    size="sm"
                    color={account.isActive ? 'success' : 'danger'}
                    variant="flat"
                  >
                    {account.isActive ? 'Activ' : 'Dezactivat'}
                  </Chip>
                </div>
                {copied === account.id && (
                  <Chip size="sm" color="success" variant="flat">
                    Copiat!
                  </Chip>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-[color:var(--ai-muted-foreground)] font-medium min-w-[160px]">
                    User GitHub:
                  </span>
                  <code className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-background)] px-2 py-0.5 rounded font-mono text-[color:var(--ai-primary)]">
                    {account.githubUsername}
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-[color:var(--ai-muted-foreground)] font-medium min-w-[160px]">
                    User Cont Microsoft:
                  </span>
                  <code className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-background)] px-2 py-0.5 rounded font-mono text-[color:var(--ai-primary)]">
                    {account.userPrincipalName}
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-[color:var(--ai-muted-foreground)] font-medium min-w-[160px]">
                    Parola:
                  </span>
                  <code className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-background)] px-2 py-0.5 rounded font-mono">
                    {account.defaultPassword}
                  </code>
                  <span className="text-[color:var(--ai-muted-foreground)] text-xs">
                    (o să îți ceară să o schimbi)
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[color:var(--ai-card-border)] text-xs text-[color:var(--ai-muted-foreground)] space-y-1">
                <p>
                  După ce scrii pe GitHub username-ul nu trebuie să introduci parola, parola o
                  cere doar la contul de Microsoft
                </p>
                <p className="font-medium text-[color:var(--ai-foreground)]">
                  Să descarci VS Code Insiders, cu acel Insiders, nu cea normală
                </p>
              </div>

              <p className="text-xs text-[color:var(--ai-muted-foreground)] mt-2 italic">
                Click pentru a copia toate informațiile
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
