import { getFirestore } from 'firebase-admin/firestore';

// Azure AD constants
const TENANT_ID = '980e9d61-8481-4105-a825-98d1f1c1b8f2';
const GITHUB_EMU_SP_ID = '8b916d21-3395-47af-a6d9-69d525ef9db9';
const GITHUB_EMU_USER_ROLE_ID = '27d9891d-2c17-4f45-a262-781a0e55c80a';
// Fallback sync job ID — getSyncJobId() will look up the real one at runtime
const GITHUB_EMU_SYNC_JOB_ID_FALLBACK =
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
 * GitHub usernames cannot contain '.' so SCIM transforms it. Generate the
 * candidate logins to try (most likely first). The "_metu" suffix is the
 * EMU enterprise short code.
 */
export function deriveGithubUsernameCandidates(mailNickname: string): string[] {
  const lower = mailNickname.toLowerCase();
  const variants = new Set<string>();
  // Most likely: dots and underscores stripped, hyphens kept
  variants.add(lower.replace(/[._]+/g, '') + '_metu');
  // Dots → hyphens (some orgs use this)
  variants.add(lower.replace(/\./g, '-') + '_metu');
  // Dots removed only
  variants.add(lower.replace(/\./g, '') + '_metu');
  // As-is (only matches if no special chars)
  variants.add(lower + '_metu');
  return Array.from(variants);
}

/**
 * Look up which GitHub username actually exists for a given mailNickname.
 * Tries each candidate via GET /users/{login} and returns the first hit.
 */
export async function resolveGithubUsername(
  mailNickname: string,
  storedUsername?: string
): Promise<{ username: string | null; tried: string[] }> {
  const token = process.env.GITHUB_ENTERPRISE_TOKEN;
  if (!token) return { username: storedUsername || null, tried: [] };

  const candidates = [
    ...(storedUsername ? [storedUsername] : []),
    ...deriveGithubUsernameCandidates(mailNickname),
  ];
  // Dedupe while preserving order
  const seen = new Set<string>();
  const ordered = candidates.filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });

  for (const candidate of ordered) {
    try {
      const res = await fetch(
        `${GITHUB_API_BASE}/users/${encodeURIComponent(candidate)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
      if (res.ok) {
        return { username: candidate, tried: ordered };
      }
    } catch {
      // ignore
    }
  }
  return { username: null, tried: ordered };
}

/**
 * Add a GitHub EMU user (by login, e.g. `foo_metu`) to the studiai-students
 * organization as a member. Idempotent — GitHub returns 200 if already a
 * member. If the user does not yet exist in GitHub (SCIM still in flight),
 * returns status `pending` so the admin UI can retry later.
 *
 * If the first attempt 404s, tries common username variants (since GitHub
 * strips dots from logins, the SCIM-generated login may differ from the
 * one we derived).
 */
export async function addUserToGitHubOrg(
  githubUsername: string,
  options: { role?: 'member' | 'admin'; mailNickname?: string } = {}
): Promise<OrgMembershipResult & { resolvedUsername?: string }> {
  const token = process.env.GITHUB_ENTERPRISE_TOKEN;
  if (!token) {
    return {
      status: 'skipped',
      error: 'GITHUB_ENTERPRISE_TOKEN not configured',
    };
  }

  const { role = 'member', mailNickname } = options;

  // Build the list of usernames to try
  const candidates = mailNickname
    ? [
        githubUsername,
        ...deriveGithubUsernameCandidates(mailNickname).filter((c) => c !== githubUsername),
      ]
    : [githubUsername];

  let lastError: string | undefined;
  let lastStatus = 0;

  for (const candidate of candidates) {
    const url = `${GITHUB_API_BASE}/orgs/${GITHUB_ORG_SLUG}/memberships/${encodeURIComponent(candidate)}`;
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
        return { status: 'added', resolvedUsername: candidate };
      }

      const errText = await res.text();
      lastStatus = res.status;
      lastError = `GitHub API ${res.status} for "${candidate}": ${errText.slice(0, 200)}`;

      // Only continue trying variants on 404 (user not found)
      if (res.status !== 404) {
        return { status: 'failed', error: lastError };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      lastStatus = 0;
    }
  }

  // All candidates 404'd — user is not yet in GitHub at any of the variants
  return {
    status: lastStatus === 404 ? 'pending' : 'failed',
    error: `Tried ${candidates.length} username variant(s) [${candidates.join(', ')}]: ${lastError || 'all 404'}`,
  };
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

/**
 * Look up the active synchronization job ID for the GitHub EMU service
 * principal. The ID looks like `gitHubEnterpriseManagedUserOidc.{tenantId}`
 * but can vary; fetching it dynamically avoids 404/401 errors when the job
 * has been recreated (which changes its ID).
 */
let cachedSyncJobId: string | null = null;
export async function getSyncJobId(token: string): Promise<string> {
  if (cachedSyncJobId) return cachedSyncJobId;
  try {
    const res = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/servicePrincipals/${GITHUB_EMU_SP_ID}/synchronization/jobs`
    );
    if (res.ok) {
      const body = await res.json();
      const jobs: Array<{ id: string; status?: { code?: string } }> = body.value || [];
      // Prefer an active/healthy job, otherwise the first one
      const active = jobs.find((j) => j.status?.code !== 'NotConfigured') || jobs[0];
      if (active?.id) {
        cachedSyncJobId = active.id;
        return active.id;
      }
    } else {
      console.warn(
        `Failed to list sync jobs (${res.status}); falling back to hardcoded ID`
      );
    }
  } catch (e) {
    console.warn('Error fetching sync job ID:', e);
  }
  return GITHUB_EMU_SYNC_JOB_ID_FALLBACK;
}

/**
 * Look up the synchronization rule ID for User objects in the EMU job's
 * schema. The rule ID is required by provisionOnDemand and varies per
 * connector — hardcoded values like 'usr' will fail with 400
 * RequestParameterInvalid when the schema uses GUIDs or different keys.
 */
const cachedRuleIdByJob = new Map<string, string>();
export async function getUserRuleId(token: string, syncJobId: string): Promise<string | null> {
  const cached = cachedRuleIdByJob.get(syncJobId);
  if (cached) return cached;
  try {
    const res = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/servicePrincipals/${GITHUB_EMU_SP_ID}/synchronization/jobs/${syncJobId}/schema`
    );
    if (!res.ok) {
      console.warn(`Failed to fetch sync schema (${res.status})`);
      return null;
    }
    const body = await res.json();
    type Rule = {
      id?: string;
      name?: string;
      sourceDirectoryName?: string;
      targetDirectoryName?: string;
      objectMappings?: Array<{
        sourceObjectName?: string;
        targetObjectName?: string;
        name?: string;
      }>;
    };
    const rules: Rule[] = body.synchronizationRules || [];
    // Find the rule that maps Users (Azure AD → SCIM User)
    for (const rule of rules) {
      const userMapping = (rule.objectMappings || []).find(
        (m) =>
          (m.sourceObjectName || '').toLowerCase() === 'user' ||
          (m.targetObjectName || '').toLowerCase() === 'user'
      );
      if (userMapping && rule.id) {
        cachedRuleIdByJob.set(syncJobId, rule.id);
        return rule.id;
      }
    }
    // Fallback: first rule with an id
    const first = rules.find((r) => r.id);
    if (first?.id) {
      cachedRuleIdByJob.set(syncJobId, first.id);
      return first.id;
    }
  } catch (e) {
    console.warn('Error fetching sync schema:', e);
  }
  return null;
}

/**
 * Trigger SCIM provisioning for one user. Resolves the sync job + rule ID
 * dynamically from the schema so the call works regardless of how the
 * EMU connector was set up. Returns the raw Graph Response.
 */
export async function provisionUserOnDemand(
  token: string,
  azureUserId: string
): Promise<{ ok: boolean; status: number; detail: string; syncJobId: string }> {
  const syncJobId = await getSyncJobId(token);
  const ruleId = await getUserRuleId(token, syncJobId);

  // Build the body: include ruleId only if we successfully resolved one,
  // since some connector versions accept a body without it.
  const subject = { objectId: azureUserId, objectTypeName: 'User' };
  const body: Record<string, unknown> = {
    parameters: [ruleId ? { ruleId, subjects: [subject] } : { subjects: [subject] }],
  };

  const res = await graphRequest(
    token,
    `https://graph.microsoft.com/v1.0/servicePrincipals/${GITHUB_EMU_SP_ID}/synchronization/jobs/${syncJobId}/provisionOnDemand`,
    'POST',
    body
  );

  if (res.ok) {
    // provisionOnDemand returns 200 with a body describing each step:
    // { value: [{ provisioningSteps: [{ name, type, status, description, details }] }] }
    // A 200 does NOT mean the user was actually written to GitHub — it means Azure
    // executed the rule. We need to inspect provisioningSteps to know if anything
    // was actually exported, skipped (out of scope), or failed.
    let summary = '';
    let actuallyProvisioned = true;
    try {
      const body = await res.json();
      type Step = {
        name?: string;
        type?: string;
        status?: string;
        description?: string;
        details?: Record<string, unknown>;
      };
      const entries: Array<{ provisioningSteps?: Step[] }> = body?.value || [];
      const steps = entries.flatMap((e) => e.provisioningSteps || []);
      const failed = steps.filter((s) => s?.status && s.status !== 'success' && s.status !== 'skipped');
      const exportSteps = steps.filter((s) => (s.type || '').toLowerCase().includes('export'));
      const exportSucceeded = exportSteps.some((s) => s.status === 'success');
      const allSkipped = steps.length > 0 && steps.every((s) => s.status === 'skipped');

      if (failed.length > 0) {
        actuallyProvisioned = false;
        summary = ` — Azure rejected: ${failed
          .map((s) => `${s.name || s.type}: ${s.description || s.status}`)
          .slice(0, 3)
          .join('; ')}`;
      } else if (allSkipped) {
        actuallyProvisioned = false;
        summary =
          ` — All steps skipped (user is likely out of scope). Open Entra ID → Enterprise Apps → GitHub EMU → Provisioning and check the scope: it must include this user (assignment + any scoping filters).`;
      } else if (exportSteps.length > 0 && !exportSucceeded) {
        actuallyProvisioned = false;
        summary = ` — Export step status: ${exportSteps.map((s) => s.status).join(', ')}`;
      } else {
        summary = ` — ${steps.length} step(s) executed`;
      }
    } catch {
      // ignore JSON parse errors, treat as opaque success
    }
    return {
      ok: actuallyProvisioned,
      status: res.status,
      detail: `Provisioning ${actuallyProvisioned ? 'triggered' : 'rejected'} (job: ${syncJobId}${ruleId ? `, rule: ${ruleId}` : ''})${summary}`,
      syncJobId,
    };
  }

  const errText = await res.text().catch(() => '');
  let detail = `Graph returned ${res.status} (job: ${syncJobId}${ruleId ? `, rule: ${ruleId}` : ', no rule resolved'})`;
  if (errText) detail += `: ${errText.slice(0, 280)}`;
  if (res.status === 401 || res.status === 403) {
    detail +=
      '. The app registration may be missing the Synchronization.ReadWrite.All permission. Azure will sync automatically every ~40 minutes.';
  } else if (res.status === 400) {
    detail +=
      '. The rule ID could not be auto-resolved. Open Entra ID → Enterprise Apps → GitHub EMU → Provisioning → "Provision on demand" once manually so Azure caches the schema, then retry.';
  }
  return { ok: false, status: res.status, detail, syncJobId };
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

    // 6. Trigger provisioning (resolves sync job + rule ID dynamically)
    const provisionResult = await provisionUserOnDemand(token, azureUserId);
    const provisionStatus = provisionResult.ok ? 'provisioned' : 'pending';
    if (!provisionResult.ok) {
      console.error('Provision on demand failed:', provisionResult.detail);
    }

    // 6b. Wait briefly for SCIM to create the GitHub user, then add to org
    // GitHub EMU provisioning is typically fast (~2-5s). We wait a short moment
    // to reduce the chance of a 404 "user not found" response.
    await new Promise((r) => setTimeout(r, 4000));
    const orgResult = await addUserToGitHubOrg(githubUsername, { mailNickname });
    if (orgResult.status !== 'added') {
      console.warn(
        `Org membership for ${githubUsername} => ${orgResult.status}:`,
        orgResult.error
      );
    }
    const finalGithubUsername = orgResult.resolvedUsername || githubUsername;

    // 7. Store in Firestore
    const accountData = {
      userId,
      azureUserId,
      userPrincipalName: upn,
      displayName: azureDisplayName,
      githubUsername: finalGithubUsername,
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
    const orgResult = await addUserToGitHubOrg(githubUsername, { mailNickname });
    const updates: Record<string, unknown> = {
      orgMembershipStatus: orgResult.status,
      orgMembershipError: orgResult.error || null,
      orgMembershipLastAttempt: new Date(),
    };
    if (orgResult.resolvedUsername && orgResult.resolvedUsername !== githubUsername) {
      updates.githubUsername = orgResult.resolvedUsername;
    }
    await docRef.update(updates);

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
  const data = snap.data() as
    | { githubUsername?: string; userPrincipalName?: string }
    | undefined;
  const githubUsername = data?.githubUsername;
  if (!githubUsername) {
    return { status: 'failed', error: 'Account has no githubUsername' };
  }
  const mailNickname = data?.userPrincipalName?.split('@')[0];
  const result = await addUserToGitHubOrg(githubUsername, { mailNickname });
  const updates: Record<string, unknown> = {
    orgMembershipStatus: result.status,
    orgMembershipError: result.error || null,
    orgMembershipLastAttempt: new Date(),
  };
  if (result.resolvedUsername && result.resolvedUsername !== githubUsername) {
    updates.githubUsername = result.resolvedUsername;
  }
  await ref.update(updates);
  return { ...result, githubUsername: result.resolvedUsername || githubUsername };
}

// ============================================================================
// Health check + repair
// ============================================================================

export type CheckStatus = 'ok' | 'missing' | 'pending' | 'error' | 'skipped';

export interface HealthCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
  /** Can this step be automatically repaired by the repair endpoint? */
  repairable: boolean;
}

export interface AccountHealth {
  accountId: string;
  githubUsername: string;
  userPrincipalName: string;
  checks: HealthCheck[];
  /** Overall: 'ok' if all checks ok/skipped, otherwise 'needs_repair' */
  overall: 'ok' | 'needs_repair';
}

async function fetchAccountDoc(userId: string, accountId: string) {
  const db = getFirestore();
  const ref = db
    .collection('users')
    .doc(userId)
    .collection('githubAccounts')
    .doc(accountId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { ref, data: snap.data() as Record<string, unknown> };
}

/**
 * Inspect a provisioned account and report the status of each step:
 * 1. Azure AD user exists and is enabled
 * 2. User is assigned the `User` role on the GitHub EMU service principal
 * 3. User is visible in the GitHub enterprise (SCIM completed)
 * 4. User is an active member of the studiai-students org
 */
export async function checkAccountHealth(params: {
  userId: string;
  accountId: string;
}): Promise<{ success: boolean; health?: AccountHealth; error?: string }> {
  const doc = await fetchAccountDoc(params.userId, params.accountId);
  if (!doc) return { success: false, error: 'Account not found' };

  const azureUserId = doc.data.azureUserId as string | undefined;
  const githubUsername = doc.data.githubUsername as string | undefined;
  const upn = doc.data.userPrincipalName as string | undefined;

  if (!azureUserId || !githubUsername || !upn) {
    return { success: false, error: 'Account document is missing required fields' };
  }

  const checks: HealthCheck[] = [];

  // 1. Azure AD user
  let token: string;
  try {
    token = await getGraphToken();
  } catch (e) {
    return {
      success: false,
      error: `Failed to get Graph token: ${e instanceof Error ? e.message : 'unknown'}`,
    };
  }

  let azureOk = false;
  let azureEnabled = false;
  try {
    const res = await graphRequest(
      token,
      `https://graph.microsoft.com/v1.0/users/${azureUserId}?$select=id,accountEnabled,userPrincipalName`
    );
    if (res.ok) {
      const body = await res.json();
      azureOk = true;
      azureEnabled = !!body.accountEnabled;
      checks.push({
        id: 'azure-user',
        label: 'Azure AD user exists',
        status: azureEnabled ? 'ok' : 'error',
        detail: azureEnabled ? `${body.userPrincipalName} (enabled)` : 'Account is disabled',
        repairable: false,
      });
    } else {
      checks.push({
        id: 'azure-user',
        label: 'Azure AD user exists',
        status: 'missing',
        detail: `Graph returned ${res.status}`,
        repairable: false,
      });
    }
  } catch (e) {
    checks.push({
      id: 'azure-user',
      label: 'Azure AD user exists',
      status: 'error',
      detail: e instanceof Error ? e.message : 'Unknown error',
      repairable: false,
    });
  }

  // 2. App role assignment on the GitHub EMU service principal
  let appRoleOk = false;
  if (azureOk) {
    try {
      const res = await graphRequest(
        token,
        `https://graph.microsoft.com/v1.0/users/${azureUserId}/appRoleAssignments`
      );
      if (res.ok) {
        const body = await res.json();
        const hasAssignment = (body.value || []).some(
          (a: { resourceId?: string }) => a.resourceId === GITHUB_EMU_SP_ID
        );
        appRoleOk = hasAssignment;
        checks.push({
          id: 'emu-assignment',
          label: 'Assigned to GitHub EMU application',
          status: hasAssignment ? 'ok' : 'missing',
          detail: hasAssignment ? 'User role granted' : 'Not assigned',
          repairable: true,
        });
      } else {
        checks.push({
          id: 'emu-assignment',
          label: 'Assigned to GitHub EMU application',
          status: 'error',
          detail: `Graph returned ${res.status}`,
          repairable: true,
        });
      }
    } catch (e) {
      checks.push({
        id: 'emu-assignment',
        label: 'Assigned to GitHub EMU application',
        status: 'error',
        detail: e instanceof Error ? e.message : 'Unknown error',
        repairable: true,
      });
    }
  } else {
    checks.push({
      id: 'emu-assignment',
      label: 'Assigned to GitHub EMU application',
      status: 'skipped',
      detail: 'Azure user check failed',
      repairable: false,
    });
  }

  // 3 + 4. GitHub visibility + org membership
  // First resolve the actual GitHub login since SCIM may have transformed
  // the derived username (e.g. dots are stripped from GitHub logins).
  const ghToken = process.env.GITHUB_ENTERPRISE_TOKEN;
  if (!ghToken) {
    checks.push({
      id: 'github-visible',
      label: 'Visible in GitHub enterprise',
      status: 'skipped',
      detail: 'GITHUB_ENTERPRISE_TOKEN not configured',
      repairable: false,
    });
    checks.push({
      id: 'org-membership',
      label: `Member of ${GITHUB_ORG_SLUG}`,
      status: 'skipped',
      detail: 'GITHUB_ENTERPRISE_TOKEN not configured',
      repairable: false,
    });
  } else {
    const upn2 = doc.data.userPrincipalName as string | undefined;
    const mailNickname2 = upn2 ? upn2.split('@')[0] : '';
    const resolved = await resolveGithubUsername(mailNickname2, githubUsername);
    const effectiveUsername = resolved.username;

    if (!effectiveUsername) {
      checks.push({
        id: 'github-visible',
        label: 'Visible in GitHub enterprise',
        status: 'pending',
        detail: `SCIM has not pushed the user yet (tried: ${resolved.tried.join(', ')})`,
        repairable: true,
      });
      checks.push({
        id: 'org-membership',
        label: `Member of ${GITHUB_ORG_SLUG}`,
        status: 'pending',
        detail: 'Waiting for SCIM sync',
        repairable: true,
      });
    } else {
      // If we found a different username than what's stored, persist it
      if (effectiveUsername !== githubUsername) {
        await doc.ref.update({ githubUsername: effectiveUsername });
      }
      try {
        const res = await fetch(
          `${GITHUB_API_BASE}/orgs/${GITHUB_ORG_SLUG}/memberships/${encodeURIComponent(effectiveUsername)}`,
          {
            headers: {
              Authorization: `Bearer ${ghToken}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );

        checks.push({
          id: 'github-visible',
          label: 'Visible in GitHub enterprise',
          status: 'ok',
          detail: `Found as @${effectiveUsername}`,
          repairable: false,
        });

        if (res.ok) {
          const body = await res.json();
          const state = body.state as string | undefined; // 'active' | 'pending'
          checks.push({
            id: 'org-membership',
            label: `Member of ${GITHUB_ORG_SLUG}`,
            status: state === 'active' ? 'ok' : 'pending',
            detail:
              state === 'active'
                ? `Role: ${body.role || 'member'}`
                : `State: ${state || 'pending'}`,
            repairable: state !== 'active',
          });
        } else if (res.status === 404) {
          checks.push({
            id: 'org-membership',
            label: `Member of ${GITHUB_ORG_SLUG}`,
            status: 'missing',
            detail: 'Not a member yet',
            repairable: true,
          });
        } else {
          const txt = await res.text();
          checks.push({
            id: 'org-membership',
            label: `Member of ${GITHUB_ORG_SLUG}`,
            status: 'error',
            detail: `GitHub returned ${res.status}: ${txt.slice(0, 200)}`,
            repairable: true,
          });
        }
      } catch (e) {
        checks.push({
          id: 'org-membership',
          label: `Member of ${GITHUB_ORG_SLUG}`,
          status: 'error',
          detail: e instanceof Error ? e.message : 'Unknown error',
          repairable: true,
        });
      }
    }
  }

  const overall = checks.every((c) => c.status === 'ok' || c.status === 'skipped')
    ? 'ok'
    : 'needs_repair';

  // Persist the latest org membership status on the Firestore doc
  const orgCheck = checks.find((c) => c.id === 'org-membership');
  if (orgCheck && orgCheck.status !== 'skipped') {
    const mappedStatus: OrgMembershipStatus =
      orgCheck.status === 'ok'
        ? 'added'
        : orgCheck.status === 'pending'
          ? 'pending'
          : 'failed';
    await doc.ref.update({
      orgMembershipStatus: mappedStatus,
      orgMembershipError: orgCheck.status === 'ok' ? null : orgCheck.detail || null,
      orgMembershipLastAttempt: new Date(),
    });
  }
  // Mirror app-role status flag too for quick UI display
  const emuCheck = checks.find((c) => c.id === 'emu-assignment');
  if (emuCheck && emuCheck.status !== 'skipped') {
    await doc.ref.update({
      appRoleAssigned: emuCheck.status === 'ok',
    });
  }

  return {
    success: true,
    health: {
      accountId: params.accountId,
      githubUsername,
      userPrincipalName: upn,
      checks,
      overall,
    },
  };
}

export interface RepairStepResult {
  id: string;
  label: string;
  ran: boolean;
  status: CheckStatus;
  detail?: string;
}

/**
 * Runs any missing/failed steps for a provisioned account:
 * - Re-assign to the EMU app if missing
 * - Trigger SCIM provisionOnDemand
 * - Add to the studiai-students org
 * Returns a fresh health check after the repair attempt.
 */
export async function repairAccount(params: {
  userId: string;
  accountId: string;
}): Promise<{
  success: boolean;
  steps?: RepairStepResult[];
  health?: AccountHealth;
  error?: string;
}> {
  const initial = await checkAccountHealth(params);
  if (!initial.success || !initial.health) {
    return { success: false, error: initial.error || 'Initial health check failed' };
  }

  const doc = await fetchAccountDoc(params.userId, params.accountId);
  if (!doc) return { success: false, error: 'Account not found' };
  const azureUserId = doc.data.azureUserId as string;
  const githubUsername = doc.data.githubUsername as string;
  const upn = doc.data.userPrincipalName as string | undefined;
  const mailNickname = upn ? upn.split('@')[0] : undefined;

  const steps: RepairStepResult[] = [];
  let token: string;
  try {
    token = await getGraphToken();
  } catch (e) {
    return {
      success: false,
      error: `Failed to get Graph token: ${e instanceof Error ? e.message : 'unknown'}`,
    };
  }

  const emuCheck = initial.health.checks.find((c) => c.id === 'emu-assignment');
  const ghCheck = initial.health.checks.find((c) => c.id === 'github-visible');
  const orgCheck = initial.health.checks.find((c) => c.id === 'org-membership');

  // Step 1: re-assign EMU app role if missing
  if (emuCheck && emuCheck.status !== 'ok' && emuCheck.repairable) {
    try {
      const res = await graphRequest(
        token,
        `https://graph.microsoft.com/v1.0/servicePrincipals/${GITHUB_EMU_SP_ID}/appRoleAssignedTo`,
        'POST',
        {
          principalId: azureUserId,
          resourceId: GITHUB_EMU_SP_ID,
          appRoleId: GITHUB_EMU_USER_ROLE_ID,
        }
      );
      steps.push({
        id: 'emu-assignment',
        label: 'Assign to GitHub EMU application',
        ran: true,
        status: res.ok ? 'ok' : 'error',
        detail: res.ok ? 'Role granted' : `Graph returned ${res.status}`,
      });
    } catch (e) {
      steps.push({
        id: 'emu-assignment',
        label: 'Assign to GitHub EMU application',
        ran: true,
        status: 'error',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  // Step 2: trigger SCIM provisioning if GitHub user not yet visible
  if (ghCheck && ghCheck.status !== 'ok') {
    try {
      const result = await provisionUserOnDemand(token, azureUserId);
      steps.push({
        id: 'provision-on-demand',
        label: 'Trigger SCIM provisioning',
        ran: true,
        status: result.ok ? 'ok' : 'error',
        detail: result.detail,
      });
      // Give SCIM time to push to GitHub. EMU SCIM exports usually
      // complete in 5-15s but can take up to 60s under load.
      if (result.ok) await new Promise((r) => setTimeout(r, 10000));
    } catch (e) {
      steps.push({
        id: 'provision-on-demand',
        label: 'Trigger SCIM provisioning',
        ran: true,
        status: 'error',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  // Step 3: add to org if not already an active member.
  // Poll up to ~40s for SCIM propagation.
  if (orgCheck && orgCheck.status !== 'ok' && orgCheck.repairable) {
    let result = await addUserToGitHubOrg(githubUsername, { mailNickname });
    let attempts = 1;
    const maxAttempts = 8;
    while (result.status === 'pending' && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000));
      result = await addUserToGitHubOrg(githubUsername, { mailNickname });
      attempts++;
    }
    const updates: Record<string, unknown> = {
      orgMembershipStatus: result.status,
      orgMembershipError: result.error || null,
      orgMembershipLastAttempt: new Date(),
    };
    if (result.resolvedUsername && result.resolvedUsername !== githubUsername) {
      updates.githubUsername = result.resolvedUsername;
    }
    await doc.ref.update(updates);
    steps.push({
      id: 'org-membership',
      label: `Add to ${GITHUB_ORG_SLUG}`,
      ran: true,
      status:
        result.status === 'added'
          ? 'ok'
          : result.status === 'pending'
            ? 'pending'
            : result.status === 'skipped'
              ? 'skipped'
              : 'error',
      detail:
        result.status === 'added'
          ? `Added successfully${attempts > 1 ? ` (after ${attempts} attempts)` : ''}`
          : result.status === 'pending'
            ? `Still pending after ${attempts} attempts — SCIM may take up to 40 minutes when on-demand sync is unavailable. Try again later.`
            : result.error || `Status: ${result.status}`,
    });
  }

  // Re-check to return the current state
  const final = await checkAccountHealth(params);

  return {
    success: true,
    steps,
    health: final.health,
  };
}
