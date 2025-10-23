/**
 * Firebase Test Utilities
 *
 * Helper functions for testing with real Firebase test project.
 * Provides authentication, Firestore operations, and cleanup utilities.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  Auth,
  User,
  deleteUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  Firestore,
  writeBatch,
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app for testing
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeTestFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);

  return { app, auth, db };
}

// Admin credentials from environment
export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@cursuri-platform.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'ahfpYGxJPcXHUIm0',
  uid: process.env.TEST_ADMIN_UID || '4IlfFMDBv9VqDCqEy4CL1eh7fcv1',
};

/**
 * Sign in with admin credentials
 */
export async function signInAsAdmin(): Promise<User> {
  const { auth } = initializeTestFirebase();

  const userCredential = await signInWithEmailAndPassword(
    auth,
    TEST_ADMIN.email,
    TEST_ADMIN.password
  );

  return userCredential.user;
}

/**
 * Create a test user account
 */
export async function createTestUser(email: string, password: string): Promise<User> {
  const { auth } = initializeTestFirebase();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  const { auth } = initializeTestFirebase();
  await signOut(auth);
}

/**
 * Delete a test user (cleanup)
 */
export async function deleteTestUser(user: User): Promise<void> {
  try {
    await deleteUser(user);
  } catch (error) {
    console.error('Error deleting test user:', error);
  }
}

/**
 * Create a test course in Firestore
 */
export async function createTestCourse(courseData: {
  name: string;
  description?: string;
  price?: number;
  status?: 'published' | 'draft';
}): Promise<string> {
  const { db } = initializeTestFirebase();

  const courseRef = doc(collection(db, 'courses'));
  const courseId = courseRef.id;

  await setDoc(courseRef, {
    name: courseData.name,
    description: courseData.description || 'Test course description',
    price: courseData.price || 0,
    status: courseData.status || 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return courseId;
}

/**
 * Delete a test course from Firestore
 */
export async function deleteTestCourse(courseId: string): Promise<void> {
  const { db } = initializeTestFirebase();

  try {
    // Delete course document
    await deleteDoc(doc(db, 'courses', courseId));

    // Note: Subcollections (lessons, reviews) would need separate cleanup
    // For thorough cleanup, you'd recursively delete subcollections
  } catch (error) {
    console.error('Error deleting test course:', error);
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<any> {
  const { db } = initializeTestFirebase();

  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    return null;
  }

  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Create or update user profile in Firestore
 */
export async function createUserProfile(
  uid: string,
  profileData: {
    email: string;
    displayName?: string;
    role?: 'user' | 'admin' | 'super_admin';
  }
): Promise<void> {
  const { db } = initializeTestFirebase();

  await setDoc(doc(db, 'users', uid), {
    email: profileData.email,
    displayName: profileData.displayName || 'Test User',
    role: profileData.role || 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  });
}

/**
 * Delete user profile from Firestore
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  const { db } = initializeTestFirebase();

  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Error deleting user profile:', error);
  }
}

/**
 * Wait for authentication state to settle
 */
export async function waitForAuthState(timeout: number = 5000): Promise<User | null> {
  const { auth } = initializeTestFirebase();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Auth state timeout'));
    }, timeout);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Clean up test data (call in afterAll or afterEach)
 */
export async function cleanupTestData(
  courseIds: string[] = [],
  userIds: string[] = []
): Promise<void> {
  const { db } = initializeTestFirebase();
  const batch = writeBatch(db);

  // Delete test courses
  for (const courseId of courseIds) {
    batch.delete(doc(db, 'courses', courseId));
  }

  // Delete test user profiles (not auth users, just Firestore docs)
  for (const userId of userIds) {
    batch.delete(doc(db, 'users', userId));
  }

  try {
    await batch.commit();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

export { auth, db, app };
