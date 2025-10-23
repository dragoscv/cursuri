/**
 * Real Firebase Authentication Test Helpers
 *
 * These utilities create REAL Firebase users and tokens for API testing.
 * All test users are automatically tracked and cleaned up after test suites.
 *
 * Usage:
 * ```typescript
 * const { token, uid } = await generateTestUserToken('test-user@example.com');
 * const adminToken = await generateTestAdminToken();
 *
 * // Cleanup after tests
 * await cleanupTestUsers();
 * ```
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Track created test users for cleanup
const createdTestUsers: string[] = [];

/**
 * Initialize Firebase Admin SDK for test user management
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin SDK credentials in .env.local');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getAuth();
}

/**
 * Generate a unique test email to avoid conflicts
 */
function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@test-cursuri.com`;
}

/**
 * Create a real Firebase user and return authentication token
 *
 * @param email - User email (optional, auto-generated if not provided)
 * @param password - User password (default: 'testPassword123')
 * @param customClaims - Custom claims to set on the user (e.g., role: 'admin')
 * @returns Object with uid, email, and token
 */
export async function generateTestUserToken(
  email?: string,
  password: string = 'testPassword123',
  customClaims?: Record<string, any>
): Promise<{ uid: string; email: string; token: string }> {
  const auth = initializeFirebaseAdmin();

  // Generate unique email if not provided
  const userEmail = email || generateTestEmail('user');

  try {
    // Create the user
    const userRecord = await auth.createUser({
      email: userEmail,
      password,
      emailVerified: true, // Auto-verify for testing
    });

    // Track for cleanup
    createdTestUsers.push(userRecord.uid);

    // Set custom claims if provided
    if (customClaims) {
      await auth.setCustomUserClaims(userRecord.uid, customClaims);
    }

    // Generate custom token
    const token = await auth.createCustomToken(userRecord.uid, customClaims);

    return {
      uid: userRecord.uid,
      email: userEmail,
      token,
    };
  } catch (error: any) {
    // If user already exists, try to get existing user
    if (error.code === 'auth/email-already-exists') {
      const existingUser = await auth.getUserByEmail(userEmail);
      const token = await auth.createCustomToken(existingUser.uid, customClaims);

      // Track for cleanup if not already tracked
      if (!createdTestUsers.includes(existingUser.uid)) {
        createdTestUsers.push(existingUser.uid);
      }

      return {
        uid: existingUser.uid,
        email: userEmail,
        token,
      };
    }
    throw error;
  }
}

/**
 * Create a test user with admin role
 *
 * @param email - Admin email (optional, auto-generated)
 * @returns Object with uid, email, and token with admin claims
 */
export async function generateTestAdminToken(
  email?: string
): Promise<{ uid: string; email: string; token: string }> {
  const adminEmail = email || generateTestEmail('admin');

  return generateTestUserToken(adminEmail, 'adminPassword123', {
    role: 'admin',
    isAdmin: true,
  });
}

/**
 * Create a test user with super_admin role
 *
 * @param email - Super admin email (optional, auto-generated)
 * @returns Object with uid, email, and token with super_admin claims
 */
export async function generateTestSuperAdminToken(
  email?: string
): Promise<{ uid: string; email: string; token: string }> {
  const superAdminEmail = email || generateTestEmail('superadmin');

  return generateTestUserToken(superAdminEmail, 'superAdminPassword123', {
    role: 'super_admin',
    isAdmin: true,
    isSuperAdmin: true,
  });
}

/**
 * Delete a specific test user by UID
 *
 * @param uid - User ID to delete
 */
export async function deleteTestUser(uid: string): Promise<void> {
  const auth = initializeFirebaseAdmin();

  try {
    await auth.deleteUser(uid);

    // Remove from tracking
    const index = createdTestUsers.indexOf(uid);
    if (index > -1) {
      createdTestUsers.splice(index, 1);
    }
  } catch (error: any) {
    // Ignore if user doesn't exist
    if (error.code !== 'auth/user-not-found') {
      console.error(`Failed to delete test user ${uid}:`, error);
    }
  }
}

/**
 * Clean up all test users created during testing
 * Call this in afterAll() or afterEach() hooks
 */
export async function cleanupTestUsers(): Promise<void> {
  const auth = initializeFirebaseAdmin();

  const deletionPromises = createdTestUsers.map(async (uid) => {
    try {
      await auth.deleteUser(uid);
    } catch (error: any) {
      // Ignore if user doesn't exist
      if (error.code !== 'auth/user-not-found') {
        console.error(`Failed to delete test user ${uid}:`, error);
      }
    }
  });

  await Promise.all(deletionPromises);

  // Clear the tracking array
  createdTestUsers.length = 0;
}

/**
 * Get the current count of tracked test users
 */
export function getTestUserCount(): number {
  return createdTestUsers.length;
}

/**
 * Verify a custom token and return the decoded claims
 * Useful for testing token validity
 */
export async function verifyTestToken(token: string): Promise<any> {
  const auth = initializeFirebaseAdmin();
  return auth.verifyIdToken(token);
}
