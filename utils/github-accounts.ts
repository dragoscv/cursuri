import { getFirestore } from 'firebase-admin/firestore';

// Azure AD constants
const TENANT_ID = '980e9d61-8481-4105-a825-98d1f1c1b8f2';
const GITHUB_EMU_SP_ID = '8b916d21-3395-47af-a6d9-69d525ef9db9';
const GITHUB_EMU_USER_ROLE_ID = '27d9891d-2c17-4f45-a262-781a0e55c80a';
const GITHUB_EMU_SYNC_JOB_ID =
  'gitHubEnterpriseManagedUserOidc.980e9d6184814105a82598d1f1c1b8f2';
const DOMAIN = 'studiai.ro';
const DEFAULT_PASSWORD = 'Studiai123#';

export { DOMAIN, DEFAULT_PASSWORD };

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
