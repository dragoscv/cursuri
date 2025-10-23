/**
 * Standalone Test Auth for API Testing
 *
 * This version uses Firebase REST API directly instead of Admin SDK
 * to avoid Jest ESM transformation issues with jose/jwks-rsa.
 *
 * For integration tests that make HTTP requests to a running server.
 */

// Track created test users for cleanup
const createdTestUsers: { uid: string; idToken: string }[] = [];

const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const ADMIN_EMAIL = 'admin@cursuri-platform.com';
const ADMIN_PASSWORD = 'AdminTest123!'; // Use the password from .credentials/admin.json

/**
 * Generate a unique test email to avoid conflicts
 */
function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@test-cursuri.com`;
}

/**
 * Create a test user with Firebase REST API
 */
async function createTestUser(
  email: string,
  password: string = 'TestPassword123!'
): Promise<{ uid: string; idToken: string; email: string }> {
  try {
    // Create user
    const signUpResponse = await fetch(`${FIREBASE_AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    if (!signUpResponse.ok) {
      const error = await signUpResponse.json();
      throw new Error(`Failed to create user: ${JSON.stringify(error)}`);
    }

    const userData = await signUpResponse.json();

    const user = {
      uid: userData.localId,
      idToken: userData.idToken,
      email: email,
    };

    createdTestUsers.push(user);
    return user;
  } catch (error: any) {
    if (error.message?.includes('EMAIL_EXISTS')) {
      // User already exists, sign in instead
      return signInTestUser(email, password);
    }
    throw error;
  }
}

/**
 * Sign in existing test user
 */
async function signInTestUser(
  email: string,
  password: string
): Promise<{ uid: string; idToken: string; email: string }> {
  const signInResponse = await fetch(
    `${FIREBASE_AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  if (!signInResponse.ok) {
    const error = await signInResponse.json();
    throw new Error(`Failed to sign in: ${JSON.stringify(error)}`);
  }

  const userData = await signInResponse.json();

  return {
    uid: userData.localId,
    idToken: userData.idToken,
    email: email,
  };
}

/**
 * Delete a test user using Firebase REST API
 */
async function deleteTestUser(idToken: string): Promise<void> {
  try {
    const response = await fetch(`${FIREBASE_AUTH_URL}:delete?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to delete user:', error);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

/**
 * Generate a test user token (regular user, no admin privileges)
 *
 * @param email - Optional email (auto-generated if not provided)
 * @param password - Optional password (defaults to TestPassword123!)
 * @returns Object with uid, email, and Firebase ID token
 */
export async function generateTestUserToken(
  email?: string,
  password: string = 'TestPassword123!'
): Promise<{ uid: string; email: string; token: string }> {
  const testEmail = email || generateTestEmail('user');
  const user = await createTestUser(testEmail, password);

  return {
    uid: user.uid,
    email: user.email,
    token: user.idToken,
  };
}

/**
 * Generate a test admin token using the real admin account
 *
 * @returns Object with uid, email, and Firebase ID token with admin claims
 */
export async function generateTestAdminToken(): Promise<{
  uid: string;
  email: string;
  token: string;
}> {
  // Use the real admin account that already has admin claims set in Firestore
  const admin = await signInTestUser(ADMIN_EMAIL, ADMIN_PASSWORD);

  return {
    uid: admin.uid,
    email: admin.email,
    token: admin.idToken,
  };
}

/**
 * Clean up all created test users
 * Call this in afterAll() hooks
 */
export async function cleanupTestUsers(): Promise<void> {
  await Promise.all(
    createdTestUsers.map(async (user) => {
      await deleteTestUser(user.idToken);
    })
  );

  createdTestUsers.length = 0; // Clear the array
}

/**
 * Get count of created test users
 */
export function getTestUserCount(): number {
  return createdTestUsers.length;
}
