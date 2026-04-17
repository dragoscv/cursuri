import { Timestamp } from 'firebase/firestore';

export interface GitHubAccount {
  /** Firestore document ID */
  id: string;
  /** Firebase user ID this account belongs to */
  userId: string;
  /** Azure AD user object ID */
  azureUserId: string;
  /** Azure AD user principal name (e.g., edotec@programoria.com) */
  userPrincipalName: string;
  /** Display name in Azure AD */
  displayName: string;
  /** GitHub username (after provisioning, format: username_metu) */
  githubUsername: string;
  /** Account number (1 for first, 2 for second, etc.) */
  accountNumber: number;
  /** Whether account is currently active in Azure */
  isActive: boolean;
  /** Linked Stripe subscription ID (if any) */
  subscriptionId?: string;
  /** Default password set on creation */
  defaultPassword: string;
  /** When the account was created */
  createdAt: Timestamp | Date;
  /** When the account was last updated */
  updatedAt?: Timestamp | Date;
  /** Admin who created this account */
  createdBy: string;
  /** GitHub org membership status */
  orgMembershipStatus?: 'added' | 'pending' | 'failed' | 'skipped';
  /** Last error from org membership attempt (if any) */
  orgMembershipError?: string;
  /** When last attempt to add to org was made */
  orgMembershipLastAttempt?: Timestamp | Date;
}

export interface CreateGitHubAccountRequest {
  /** Firebase user ID to create account for */
  userId: string;
  /** The user's email (used to derive the username) */
  userEmail: string;
  /** Optional display name override */
  displayName?: string;
}

export interface ToggleGitHubAccountRequest {
  /** Firestore document ID of the GitHub account */
  accountId: string;
  /** Firebase user ID */
  userId: string;
  /** Whether to enable or disable */
  enabled: boolean;
}

export interface LinkSubscriptionRequest {
  /** Firestore document ID of the GitHub account */
  accountId: string;
  /** Firebase user ID */
  userId: string;
  /** Stripe subscription ID to link */
  subscriptionId: string;
}

export interface GitHubAccountInfo {
  githubUsername: string;
  microsoftAccount: string;
  defaultPassword: string;
  isActive: boolean;
  accountNumber: number;
  subscriptionId?: string;
}
