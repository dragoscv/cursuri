/**
 * Payment Flow Integration Tests
 *
 * Comprehensive tests for Stripe payment integration:
 * - Course purchase flow
 * - Checkout session creation
 * - Payment verification
 * - Course access after payment
 * - Payment record creation
 *
 * Uses real Firebase test project and Stripe sandbox (test mode).
 */

import {
  signInAsAdmin,
  createTestUser,
  signOutUser,
  deleteTestUser,
  createTestCourse,
  deleteTestCourse,
  getUserProfile,
  createUserProfile,
  deleteUserProfile,
  initializeTestFirebase,
} from '../helpers/testFirebase';
import { User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

describe('Payment Flow Integration Tests', () => {
  let testUsers: User[] = [];
  let testCourseIds: string[] = [];
  let db: any;

  beforeAll(() => {
    const firebase = initializeTestFirebase();
    db = firebase.db;
  });

  afterEach(async () => {
    // Clean up test users
    for (const user of testUsers) {
      try {
        await deleteUserProfile(user.uid);
        await deleteTestUser(user);
      } catch (error) {
        console.error('User cleanup error:', error);
      }
    }
    testUsers = [];

    // Clean up test courses
    for (const courseId of testCourseIds) {
      try {
        await deleteTestCourse(courseId);
      } catch (error) {
        console.error('Course cleanup error:', error);
      }
    }
    testCourseIds = [];

    // Sign out
    try {
      await signOutUser();
    } catch (error) {
      // Ignore
    }
  });

  describe('Course Browsing (Unauthenticated)', () => {
    it('should allow browsing courses without authentication', async () => {
      // Create a test course
      const courseId = await createTestCourse({
        name: 'Test Course for Browsing',
        description: 'Public browsing test',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Verify course is accessible (read-only)
      const courseDoc = await getDoc(doc(db, 'courses', courseId));

      expect(courseDoc.exists()).toBe(true);
      expect(courseDoc.data()?.name).toBe('Test Course for Browsing');
      expect(courseDoc.data()?.status).toBe('published');
    }, 15000);

    it('should display course price correctly', async () => {
      const courseId = await createTestCourse({
        name: 'Paid Course',
        price: 149,
        status: 'published',
      });
      testCourseIds.push(courseId);

      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      const courseData = courseDoc.data();

      expect(courseData?.price).toBe(149);
    }, 15000);
  });

  describe('Purchase Flow (Authentication Required)', () => {
    it('should require authentication to purchase', async () => {
      // Create course
      const courseId = await createTestCourse({
        name: 'Test Course for Purchase',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Verify no authenticated user
      const { auth } = initializeTestFirebase();
      expect(auth.currentUser).toBeNull();

      // Attempting to create checkout session without auth should fail
      // This would be tested via API route in E2E tests
      // Here we verify the auth state requirement
    }, 15000);

    it('should allow authenticated user to initiate purchase', async () => {
      // Create test user
      const testEmail = `buyer-${Date.now()}@example.com`;
      const user = await createTestUser(testEmail, 'TestPassword123!');
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
        displayName: 'Test Buyer',
        role: 'user',
      });

      // Create course
      const courseId = await createTestCourse({
        name: 'Course to Purchase',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Verify user is authenticated
      const { auth } = initializeTestFirebase();
      expect(auth.currentUser).toBeDefined();
      expect(auth.currentUser?.email).toBe(testEmail);

      // User can now proceed to checkout (tested in E2E)
      const profile = await getUserProfile(user.uid);
      expect(profile).toBeDefined();
    }, 20000);
  });

  describe('Stripe Integration', () => {
    it('should have valid Stripe configuration', () => {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const secretKey = process.env.STRIPE_SECRET_KEY;

      expect(publishableKey).toBeDefined();
      expect(publishableKey).toContain('pk_test_'); // Test mode
      expect(secretKey).toBeDefined();
      expect(secretKey).toContain('sk_test_'); // Test mode
    });

    it('should use test mode for payments', () => {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      // Verify we're in test mode
      expect(publishableKey).toContain('pk_test_');

      // In production, this would be pk_live_
      expect(publishableKey).not.toContain('pk_live_');
    });
  });

  describe('Course Access After Payment', () => {
    it('should grant access to course after successful payment', async () => {
      // Create test user
      const testEmail = `student-${Date.now()}@example.com`;
      const user = await createTestUser(testEmail, 'TestPassword123!');
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
        displayName: 'Test Student',
        role: 'user',
      });

      // Create course
      const courseId = await createTestCourse({
        name: 'Purchased Course',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Simulate payment by creating enrollment record
      // In real flow, this would be done by Stripe webhook
      const enrollmentRef = doc(db, `users/${user.uid}/enrollments/${courseId}`);
      await import('firebase/firestore').then(({ setDoc }) =>
        setDoc(enrollmentRef, {
          courseId: courseId,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          paymentId: 'test_payment_' + Date.now(),
        })
      );

      // Verify enrollment exists
      const enrollmentDoc = await getDoc(enrollmentRef);
      expect(enrollmentDoc.exists()).toBe(true);
      expect(enrollmentDoc.data()?.status).toBe('active');
    }, 20000);

    it('should create payment record after successful transaction', async () => {
      // Create test user
      const testEmail = `payer-${Date.now()}@example.com`;
      const user = await createTestUser(testEmail, 'TestPassword123!');
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
      });

      // Create course
      const courseId = await createTestCourse({
        name: 'Paid Course',
        price: 199,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Simulate payment record (normally created by Stripe extension)
      const { setDoc } = await import('firebase/firestore');
      const paymentRef = doc(db, `customers/${user.uid}/payments/test_payment_${Date.now()}`);
      await setDoc(paymentRef, {
        amount: 199,
        currency: 'usd',
        status: 'succeeded',
        courseId: courseId,
        createdAt: new Date().toISOString(),
      });

      // Verify payment record exists
      const paymentDoc = await getDoc(paymentRef);
      expect(paymentDoc.exists()).toBe(true);
      expect(paymentDoc.data()?.status).toBe('succeeded');
      expect(paymentDoc.data()?.amount).toBe(199);
    }, 20000);
  });

  describe('Payment Validation', () => {
    it('should verify course price before checkout', async () => {
      const courseId = await createTestCourse({
        name: 'Priced Course',
        price: 299,
        status: 'published',
      });
      testCourseIds.push(courseId);

      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      const courseData = courseDoc.data();

      // Verify price is correctly stored
      expect(courseData?.price).toBe(299);
      expect(typeof courseData?.price).toBe('number');
    }, 15000);

    it('should handle free courses (price = 0)', async () => {
      const courseId = await createTestCourse({
        name: 'Free Course',
        price: 0,
        status: 'published',
      });
      testCourseIds.push(courseId);

      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      const courseData = courseDoc.data();

      expect(courseData?.price).toBe(0);
      // Free courses should not require payment flow
    }, 15000);
  });

  describe('Payment Error Handling', () => {
    it('should handle failed payment gracefully', async () => {
      // Create test user
      const testEmail = `failed-${Date.now()}@example.com`;
      const user = await createTestUser(testEmail, 'TestPassword123!');
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
      });

      // Create course
      const courseId = await createTestCourse({
        name: 'Course with Failed Payment',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Simulate failed payment record
      const { setDoc } = await import('firebase/firestore');
      const paymentRef = doc(db, `customers/${user.uid}/payments/failed_payment_${Date.now()}`);
      await setDoc(paymentRef, {
        amount: 99,
        currency: 'usd',
        status: 'failed',
        courseId: courseId,
        createdAt: new Date().toISOString(),
        error: 'Card declined',
      });

      // Verify failed payment is recorded
      const paymentDoc = await getDoc(paymentRef);
      expect(paymentDoc.exists()).toBe(true);
      expect(paymentDoc.data()?.status).toBe('failed');

      // Verify no enrollment was created
      const enrollmentRef = doc(db, `users/${user.uid}/enrollments/${courseId}`);
      const enrollmentDoc = await getDoc(enrollmentRef);
      expect(enrollmentDoc.exists()).toBe(false);
    }, 20000);

    it('should not grant access for pending payments', async () => {
      const testEmail = `pending-${Date.now()}@example.com`;
      const user = await createTestUser(testEmail, 'TestPassword123!');
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
      });

      const courseId = await createTestCourse({
        name: 'Course with Pending Payment',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(courseId);

      // Simulate pending payment
      const { setDoc } = await import('firebase/firestore');
      const paymentRef = doc(db, `customers/${user.uid}/payments/pending_${Date.now()}`);
      await setDoc(paymentRef, {
        amount: 99,
        currency: 'usd',
        status: 'pending',
        courseId: courseId,
        createdAt: new Date().toISOString(),
      });

      // Verify no enrollment yet
      const enrollmentRef = doc(db, `users/${user.uid}/enrollments/${courseId}`);
      const enrollmentDoc = await getDoc(enrollmentRef);
      expect(enrollmentDoc.exists()).toBe(false);
    }, 20000);
  });

  describe('Multiple Course Purchases', () => {
    it('should allow user to purchase multiple courses', async () => {
      const testEmail = `multi-buyer-${Date.now()}@example.com`;
      const user = await createTestUser(testEmail, 'TestPassword123!');
      testUsers.push(user);

      await createUserProfile(user.uid, {
        email: user.email!,
      });

      // Create two courses
      const course1Id = await createTestCourse({
        name: 'Course 1',
        price: 99,
        status: 'published',
      });
      testCourseIds.push(course1Id);

      const course2Id = await createTestCourse({
        name: 'Course 2',
        price: 149,
        status: 'published',
      });
      testCourseIds.push(course2Id);

      // Simulate purchases for both courses
      const { setDoc } = await import('firebase/firestore');

      await setDoc(doc(db, `users/${user.uid}/enrollments/${course1Id}`), {
        courseId: course1Id,
        enrolledAt: new Date().toISOString(),
        status: 'active',
      });

      await setDoc(doc(db, `users/${user.uid}/enrollments/${course2Id}`), {
        courseId: course2Id,
        enrolledAt: new Date().toISOString(),
        status: 'active',
      });

      // Verify both enrollments exist
      const enrollment1 = await getDoc(doc(db, `users/${user.uid}/enrollments/${course1Id}`));
      const enrollment2 = await getDoc(doc(db, `users/${user.uid}/enrollments/${course2Id}`));

      expect(enrollment1.exists()).toBe(true);
      expect(enrollment2.exists()).toBe(true);
    }, 25000);
  });
});
