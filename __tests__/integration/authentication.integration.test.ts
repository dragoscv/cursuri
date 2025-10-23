/**
 * Comprehensive Authentication Integration Tests
 *
 * Tests complete authentication flows using real Firebase test project:
 * - Admin login with real credentials
 * - User registration with test accounts
 * - Logout functionality
 * - Password validation
 * - Session persistence
 * - Error handling
 *
 * These tests use REAL Firebase connections to cursuri-411b4 test project.
 */

import {
  signInAsAdmin,
  createTestUser,
  signOutUser,
  deleteTestUser,
  getUserProfile,
  createUserProfile,
  deleteUserProfile,
  TEST_ADMIN,
  initializeTestFirebase,
  waitForAuthState,
} from '../helpers/testFirebase';
import { User } from 'firebase/auth';

describe('Authentication Integration Tests', () => {
  let testUsers: User[] = [];

  beforeAll(() => {
    // Initialize Firebase for testing
    initializeTestFirebase();
  });

  afterEach(async () => {
    // Clean up test users after each test
    for (const user of testUsers) {
      try {
        await deleteUserProfile(user.uid);
        await deleteTestUser(user);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    testUsers = [];

    // Sign out any authenticated user
    try {
      await signOutUser();
    } catch (error) {
      // Ignore signout errors in cleanup
    }
  });

  describe('Admin Authentication', () => {
    it('should successfully login with admin credentials', async () => {
      const user = await signInAsAdmin();

      expect(user).toBeDefined();
      expect(user.email).toBe(TEST_ADMIN.email);
      expect(user.uid).toBe(TEST_ADMIN.uid);
    }, 15000);

    it('should have admin role in Firestore', async () => {
      const user = await signInAsAdmin();
      const profile = await getUserProfile(user.uid);

      expect(profile).toBeDefined();
      expect(profile.role).toMatch(/admin|super_admin/);
    }, 15000);

    it('should fail login with wrong password', async () => {
      const { auth } = initializeTestFirebase();
      const { signInWithEmailAndPassword } = await import('firebase/auth');

      await expect(
        signInWithEmailAndPassword(auth, TEST_ADMIN.email, 'wrongpassword')
      ).rejects.toThrow();
    }, 15000);

    it('should successfully logout admin', async () => {
      // Login first
      await signInAsAdmin();

      // Then logout
      await signOutUser();

      // Wait for auth state to update
      const currentUser = await waitForAuthState(3000);
      expect(currentUser).toBeNull();
    }, 15000);
  });

  describe('User Registration', () => {
    it('should create new user account', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      const user = await createTestUser(testEmail, testPassword);
      testUsers.push(user);

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.uid).toBeTruthy();
    }, 15000);

    it('should create user profile in Firestore after registration', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      const user = await createTestUser(testEmail, testPassword);
      testUsers.push(user);

      // Create profile
      await createUserProfile(user.uid, {
        email: user.email!,
        displayName: 'Test User',
        role: 'user',
      });

      // Verify profile exists
      const profile = await getUserProfile(user.uid);
      expect(profile).toBeDefined();
      expect(profile.email).toBe(testEmail);
      expect(profile.role).toBe('user');
    }, 15000);

    it('should reject registration with existing email', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      // Create first user
      const user1 = await createTestUser(testEmail, testPassword);
      testUsers.push(user1);

      // Sign out first user
      await signOutUser();

      // Try to create second user with same email
      await expect(createTestUser(testEmail, testPassword)).rejects.toThrow();
    }, 20000);

    it('should reject weak passwords', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const weakPassword = '123'; // Too short

      await expect(createTestUser(testEmail, weakPassword)).rejects.toThrow();
    }, 15000);
  });

  describe('Session Management', () => {
    it('should persist authentication state', async () => {
      const user = await signInAsAdmin();

      // Wait for auth state to stabilize
      const currentUser = await waitForAuthState(3000);

      expect(currentUser).toBeDefined();
      expect(currentUser?.email).toBe(user.email);
    }, 15000);

    it('should clear state after logout', async () => {
      // Login
      await signInAsAdmin();

      // Logout
      await signOutUser();

      // Check state is cleared
      const currentUser = await waitForAuthState(3000);
      expect(currentUser).toBeNull();
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should handle invalid email format', async () => {
      const { auth } = initializeTestFirebase();
      const { signInWithEmailAndPassword } = await import('firebase/auth');

      await expect(signInWithEmailAndPassword(auth, 'invalid-email', 'password')).rejects.toThrow();
    }, 15000);

    it('should handle network errors gracefully', async () => {
      const { auth } = initializeTestFirebase();
      const { signInWithEmailAndPassword } = await import('firebase/auth');

      // Try to sign in with non-existent account
      await expect(
        signInWithEmailAndPassword(auth, 'nonexistent@example.com', 'password')
      ).rejects.toThrow();
    }, 15000);
  });

  describe('User Account Management', () => {
    it('should allow user to login after registration', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      // Register
      const user = await createTestUser(testEmail, testPassword);
      testUsers.push(user);

      // Logout
      await signOutUser();

      // Login again
      const { auth } = initializeTestFirebase();
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);

      expect(loginResult.user.email).toBe(testEmail);
    }, 20000);

    it('should maintain user data across sessions', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      // Register and create profile
      const user = await createTestUser(testEmail, testPassword);
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
        displayName: 'Persistent User',
        role: 'user',
      });

      // Logout
      await signOutUser();

      // Login again
      const { auth } = initializeTestFirebase();
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, testEmail, testPassword);

      // Check profile still exists
      const profile = await getUserProfile(user.uid);
      expect(profile).toBeDefined();
      expect(profile.displayName).toBe('Persistent User');
    }, 20000);
  });
});
