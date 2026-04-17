import { getFirestore } from 'firebase-admin/firestore';

// Azure AD constants
const TENANT_ID = '980e9d61-8481-4105-a825-98d1f1c1b8f2';
const GITHUB_EMU_SP_ID = '8b916d21-3395-47af-a6d9-69d525ef9db9';
const GITHUB_EMU_USER_ROLE_ID = '27d9891d-2c17-4f45-a262-781a0e55c80a';
const GITHUB_EMU_SYNC_JOB_ID =
  'gitHubEnterpriseManagedUserOidc.980e9d6184814105a82598d1f1c1b8f2';
const DOMAIN = 'studiai.ro';
const DEFAULT_PASSWORD = 'Studiai123#';

// GitHub Enterprise Managed Users constants
const GITHUB_ORG_SLUG = process.env.GITHUB_ORG_SLUG || 'studiai-students';
const GITHUB_API_BASE = 'https://api.github.com';

export { DOMAIN, DEFAULT_PASSWORD, GITHUB_ORG_SLUG };

export type OrgMembershipStatus = 'added' | 'pending' | 'failed' | 'skipped';

export interface OrgMembershipResult {
  status: OrgMembershipStatus;
  error?: string;
}

/**
 * Add a GitHub EMU user (by login, e.g. `foo_metu`) to the studiai-students
 * organization as a member. Idempotent — GitHub returns 200 if already a
 * member. If the user does not yet exist in GitHub (SCIM still in flight),
 * returns status `pending` so the admin UI can retry later.
 */
export async function addUserToGitHubOrg(
  githubUsername: string,
  options: { role?: 'member' | 'admin' } = {}
): Promise<OrgMembershipResult> {
  const token = process.env.GITHUB_ENTERPRISE_TOKEN;
  if (!token) {
    return {
      status: 'skipped',
      error: 'GITHUB_ENTERPRISE_TOKEN not configured',
    };
  }

  const { role = 'member' } = options;
  const url = `${GITHUB_API_BASE}/orgs/${GITHUB_ORG_SLUG}/memberships/${encodeURIComponent(githubUsername)}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      return { status: 'added' };
    }

    const errText = await res.text();
    // 404 => user not found in enterprise yet (SCIM may still be syncing)
    if (res.status === 404) {
      return {
        status: 'pending',
        error: `User not yet visible in GitHub (${res.status}): ${errText}`,
      };
    }
    return {
      status: 'failed',
      error: `GitHub API ${res.status}: ${errText}`,
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getGraphToken(): Promise<string> {
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Azure AD credentials not configured (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)');
  }

  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get Graph API token: ${error}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function graphRequest(
  token: string,
  url: string,
  method: string = 'GET',
  body?: Record<string, unknown>
): Promise<Response> {
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

export function deriveUsername(email: string): string {
  const localPart = email.split('@')[0];
  return localPart.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

export async function setAzureAccountEnabled(
  azureUserId: string,
  enabled: boolean
): Promise<boolean> {
  try {
    const token = await getGraphToken();
    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${azureUserId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountEnabled: enabled }),
    });
    return res.ok;
  } catch (error) {
    console.error(
      `Failed to ${enabled ? 'enable' : 'disable'} Azure user ${azureUserId}:`,
      error
    );
    return false;
  }
}

export interface CreateAccountResult {
  success: boolean;
  account?: {
    id: string;
    userId: string;
    azureUserId: string;
    userPrincipalName: string;
    displayName: string;
    githubUsername: string;
    accountNumber: number;
    isActive: boolean;
    defaultPassword: string;
    subscriptionId?: string;
    provisionStatus: string;
    orgMembershipStatus?: OrgMembershipStatus;
    orgMembershipError?: string;
    createdAt: Date;
    createdBy: string;
  };
  error?: string;
  details?: string;
}

/**
 * Core function to create a GitHub account for a user.
 * Used by both admin API and subscription webhook.
 */
export async function createGitHubAccount(params: {
  userId: string;
  userEmail: string;
  displayName?: string;
  createdBy: string;
  subscriptionId?: string;
}): Promise<CreateAccountResult> {
  const { userId, userEmail, displayName, createdBy, subscriptionId } = params;

  try {
    const token = await getGraphToken();
    const db = getFirestore();

    // 1. Determine account number
    const existingSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .orderBy('accountNumber', 'desc')
      .limit(1)
      .get();

    const nextAccountNumber = existingSnapshot.empty
      ? 1
      : (existingSnapshot.docs[0].data().accountNumber || 0) + 1;

    // 2. Derive username
    const baseUsername = deriveUsername(userEmail);
    const suffix = nextAccountNumber > 1 ? String(nextAccountNumber).padStart(2, '0') : '';
    const mailNickname = `${baseUsername}${suffix}`;
    const upn = `${mailNickname}@${DOMAIN}`;
    const azureDisplayName =
      displayName ||
      `${baseUsername.charAt(0).toUpperCase() + baseUsername.slice(1)}${suffix ? ' ' + suffix : ''}`;
    const githubUsername = `${mailNickname}_metu`;

    // 3. Check if user already exists
    const checkRes = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(upn)}`
    );
    if (checkRes.ok) {
      return { success: false, error: `Account ${upn} already exists` };
    }

    // 4. Create user in identity provider
    const createUserRes = await graphRequest(
      token,
      'https://graph.microsoft.com/v1.0/users',
      'POST',
      {
        accountEnabled: true,
        displayName: azureDisplayName,
        mailNickname: mailNickname,
        userPrincipalName: upn,
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password: DEFAULT_PASSWORD,
        },
      }
    );

    if (!createUserRes.ok) {
      const err = await createUserRes.text();
      console.error('Failed to create identity user:', err);
      return { success: false, error: 'Failed to create account', details: err };
    }

    const azureUser = await createUserRes.json();
    const azureUserId = azureUser.id;

    // 5. Assign user to GitHub Enterprise app
    const assignRes = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/servicePrincipals/${GITHUB_EMU_SP_ID}/appRoleAssignedTo`,
      'POST',
      {
        principalId: azureUserId,
        resourceId: GITHUB_EMU_SP_ID,
        appRoleId: GITHUB_EMU_USER_ROLE_ID,
      }
    );

    if (!assignRes.ok) {
      const err = await assignRes.text();
      console.error('Failed to assign to GitHub app:', err);
    }

    // 6. Trigger provisioning
    const provisionRes = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/servicePrincipals/${GITHUB_EMU_SP_ID}/synchronization/jobs/${GITHUB_EMU_SYNC_JOB_ID}/provisionOnDemand`,
      'POST',
      {
        parameters: [
          {
            ruleId: 'usr',
            subjects: [{ objectId: azureUserId, objectTypeName: 'User' }],
          },
        ],
      }
    );

    const provisionStatus = provisionRes.ok ? 'provisioned' : 'pending';
    if (!provisionRes.ok) {
      console.error('Provision on demand response:', await provisionRes.text());
    }

    // 6b. Wait briefly for SCIM to create the GitHub user, then add to org
    // GitHub EMU provisioning is typically fast (~2-5s). We wait a short moment
    // to reduce the chance of a 404 "user not found" response.
    await new Promise((r) => setTimeout(r, 4000));
    const orgResult = await addUserToGitHubOrg(githubUsername);
    if (orgResult.status !== 'added') {
      console.warn(
        `Org membership for ${githubUsername} => ${orgResult.status}:`,
        orgResult.error
      );
    }

    // 7. Store in Firestore
    const accountData = {
      userId,
      azureUserId,
      userPrincipalName: upn,
      displayName: azureDisplayName,
      githubUsername,
      accountNumber: nextAccountNumber,
      isActive: true,
      defaultPassword: DEFAULT_PASSWORD,
      subscriptionId: subscriptionId || null,
      createdAt: new Date(),
      createdBy,
      orgMembershipStatus: orgResult.status,
      orgMembershipError: orgResult.error || null,
      orgMembershipLastAttempt: new Date(),
    };

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .add(accountData);

    return {
      success: true,
      account: {
        id: docRef.id,
        ...accountData,
        subscriptionId: subscriptionId || undefined,
        provisionStatus,
        orgMembershipStatus: orgResult.status,
        orgMembershipError: orgResult.error,
      },
    };
  } catch (error) {
    console.error('Error creating GitHub account:', error);
    return {
      success: false,
      error: 'Failed to create GitHub account',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export interface AzureUserSummary {
  azureUserId: string;
  userPrincipalName: string;
  displayName: string;
  mailNickname: string;
  accountEnabled: boolean;
  derivedGithubUsername: string;
  alreadyLinked: boolean;
  linkedToUserId?: string;
}

/**
 * List all Azure AD users on the studiai.ro domain along with whether they
 * are already linked to a Firebase user. Used by the admin UI to attach
 * existing accounts.
 */
export async function listAvailableAzureUsers(): Promise<{
  success: boolean;
  users?: AzureUserSummary[];
  error?: string;
}> {
  try {
    const token = await getGraphToken();
    const db = getFirestore();

    // 1. Fetch all linked accounts across all users (collection group query)
    const linkedSnapshot = await db.collectionGroup('githubAccounts').get();
    const linkedByAzureId = new Map<string, string>();
    linkedSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.azureUserId) {
        // doc.ref.parent.parent.id => userId
        const parentDoc = doc.ref.parent.parent;
        linkedByAzureId.set(data.azureUserId, parentDoc?.id || '');
      }
    });

    // 2. Fetch Azure users on the studiai.ro domain (paginated)
    const select = 'id,userPrincipalName,displayName,mailNickname,accountEnabled';
    const filter = `endsWith(userPrincipalName,'@${DOMAIN}')`;
    let url = `https://graph.microsoft.com/v1.0/users?$select=${select}&$filter=${encodeURIComponent(filter)}&$top=999&$count=true`;

    const azureUsers: Array<{
      id: string;
      userPrincipalName: string;
      displayName: string;
      mailNickname: string;
      accountEnabled: boolean;
    }> = [];

    // Graph requires ConsistencyLevel: eventual when using $filter with endsWith + $count
    let safetyCounter = 0;
    while (url && safetyCounter < 20) {
      safetyCounter++;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ConsistencyLevel: 'eventual',
        },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Graph users query failed: ${errText}`);
      }
      const data = await res.json();
      if (Array.isArray(data.value)) {
        azureUsers.push(...data.value);
      }
      url = data['@odata.nextLink'] || '';
    }

    const summaries: AzureUserSummary[] = azureUsers.map((u) => {
      const mailNickname = u.mailNickname || u.userPrincipalName.split('@')[0];
      const linkedTo = linkedByAzureId.get(u.id);
      return {
        azureUserId: u.id,
        userPrincipalName: u.userPrincipalName,
        displayName: u.displayName,
        mailNickname,
        accountEnabled: u.accountEnabled,
        derivedGithubUsername: `${mailNickname}_metu`,
        alreadyLinked: !!linkedTo,
        linkedToUserId: linkedTo || undefined,
      };
    });

    // Sort: unlinked first, then by displayName
    summaries.sort((a, b) => {
      if (a.alreadyLinked !== b.alreadyLinked) return a.alreadyLinked ? 1 : -1;
      return (a.displayName || '').localeCompare(b.displayName || '');
    });

    return { success: true, users: summaries };
  } catch (error) {
    console.error('Error listing Azure users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list Azure users',
    };
  }
}

/**
 * Link an EXISTING Azure AD account to a Firebase user without creating
 * anything in Azure. The account is added to the user's githubAccounts
 * subcollection in Firestore. Optionally attach a subscription.
 */
export async function linkExistingGitHubAccount(params: {
  userId: string;
  azureUserId: string;
  createdBy: string;
  subscriptionId?: string;
}): Promise<CreateAccountResult> {
  const { userId, azureUserId, createdBy, subscriptionId } = params;

  try {
    const token = await getGraphToken();
    const db = getFirestore();

    // 1. Make sure this Azure user isn't already linked to any user
    const dupeSnapshot = await db
      .collectionGroup('githubAccounts')
      .where('azureUserId', '==', azureUserId)
      .limit(1)
      .get();

    if (!dupeSnapshot.empty) {
      const owner = dupeSnapshot.docs[0].ref.parent.parent?.id;
      return {
        success: false,
        error: `This account is already linked${owner ? ` to user ${owner}` : ''}`,
      };
    }

    // 2. Fetch details from Graph
    const res = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/users/${azureUserId}?$select=id,userPrincipalName,displayName,mailNickname,accountEnabled`
    );
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: 'Azure user not found', details: err };
    }
    const azureUser = await res.json();
    const mailNickname: string =
      azureUser.mailNickname || (azureUser.userPrincipalName as string).split('@')[0];
    const githubUsername = `${mailNickname}_metu`;

    // 3. Determine next account number for this Firebase user
    const existingSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .orderBy('accountNumber', 'desc')
      .limit(1)
      .get();
    const nextAccountNumber = existingSnapshot.empty
      ? 1
      : (existingSnapshot.docs[0].data().accountNumber || 0) + 1;

    // 4. Store in Firestore
    const accountData = {
      userId,
      azureUserId,
      userPrincipalName: azureUser.userPrincipalName,
      displayName: azureUser.displayName,
      githubUsername,
      accountNumber: nextAccountNumber,
      isActive: !!azureUser.accountEnabled,
      defaultPassword: DEFAULT_PASSWORD,
      subscriptionId: subscriptionId || null,
      createdAt: new Date(),
      createdBy,
      linkedFromExisting: true,
    };

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('githubAccounts')
      .add(accountData);

    // 5. Ensure user is a member of the GitHub org (idempotent)
    const orgResult = await addUserToGitHubOrg(githubUsername);
    await docRef.update({
      orgMembershipStatus: orgResult.status,
      orgMembershipError: orgResult.error || null,
      orgMembershipLastAttempt: new Date(),
    });

    return {
      success: true,
      account: {
        id: docRef.id,
        ...accountData,
        subscriptionId: subscriptionId || undefined,
        provisionStatus: 'linked',
        orgMembershipStatus: orgResult.status,
        orgMembershipError: orgResult.error,
      },
    };
  } catch (error) {
    console.error('Error linking existing GitHub account:', error);
    return {
      success: false,
      error: 'Failed to link existing account',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retry adding a previously-created account to the GitHub org. Used when the
 * initial attempt landed in `pending` or `failed` (typically because SCIM
 * hadn't propagated yet). Updates the Firestore doc with the new status.
 */
export async function retryAddAccountToOrg(params: {
  userId: string;
  accountId: string;
}): Promise<OrgMembershipResult & { githubUsername?: string }> {
  const { userId, accountId } = params;
  const db = getFirestore();
  const ref = db.collection('users').doc(userId).collection('githubAccounts').doc(accountId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { status: 'failed', error: 'Account not found' };
  }
  const data = snap.data() as { githubUsername?: string } | undefined;
  const githubUsername = data?.githubUsername;
  if (!githubUsername) {
    return { status: 'failed', error: 'Account has no githubUsername' };
  }
  const result = await addUserToGitHubOrg(githubUsername);
  await ref.update({
    orgMembershipStatus: result.status,
    orgMembershipError: result.error || null,
    orgMembershipLastAttempt: new Date(),
  });
  return { ...result, githubUsername };
}
