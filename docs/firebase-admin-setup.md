# Firebase Admin SDK Setup Guide

## Overview

This guide documents the Firebase Admin SDK configuration, credentials, and initialization patterns used in the Cursuri platform for API route testing and server-side operations.

## Prerequisites

- Firebase project with Admin SDK enabled
- Service account credentials (JSON file)
- Environment variables configured

## Environment Configuration

### Required Environment Variables

```bash
# Firebase Project Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Admin SDK Credentials
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Admin User (for testing)
FIREBASE_ADMIN_EMAIL=admin@cursuri-platform.com
FIREBASE_ADMIN_PASSWORD=your-admin-password
```

### Environment File Structure

```
.env.local                 # Local development (gitignored)
.env.production           # Production secrets (gitignored)
.env.example              # Template for required variables
```

## Firebase Admin SDK Initialization

### Standard Pattern (API Routes)

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (singleton pattern)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Get service instances
const db = getFirestore();
const storage = getStorage();
const bucket = storage.bucket();
```

### Testing Pattern (Jest Tests)

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize once per test suite
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

describe('My Test Suite', () => {
  beforeAll(async () => {
    // Setup test data using Admin SDK
    await db.collection('courses').doc('test-course').set({
      name: 'Test Course',
      createdAt: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.collection('courses').doc('test-course').delete();
  });
});
```

## Common Use Cases

### 1. Firestore Operations (Bypassing Security Rules)

The Admin SDK bypasses Firestore security rules, allowing test setup and cleanup:

```typescript
// Create test data
await db.collection('users').doc('test-user').set({
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
});

// Read test data
const docRef = db.collection('users').doc('test-user');
const doc = await docRef.get();
const userData = doc.data();

// Update test data
await docRef.update({
  lastLogin: new Date().toISOString(),
});

// Delete test data
await docRef.delete();
```

### 2. Nested Collections (Subcollections)

```typescript
// Create lesson under course
await db.collection('courses').doc('course-123').collection('lessons').doc('lesson-456').set({
  title: 'Introduction',
  duration: 600,
  createdAt: new Date().toISOString(),
});

// Query all lessons in a course
const lessonsSnapshot = await db
  .collection('courses')
  .doc('course-123')
  .collection('lessons')
  .get();

const lessons = lessonsSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));
```

### 3. Batch Operations

```typescript
const batch = db.batch();

// Create multiple documents
for (let i = 0; i < 10; i++) {
  const ref = db.collection('courses').doc(`test-course-${i}`);
  batch.set(ref, {
    name: `Test Course ${i}`,
    createdAt: new Date().toISOString(),
  });
}

// Commit all operations atomically
await batch.commit();
```

### 4. Transaction Operations

```typescript
await db.runTransaction(async (transaction) => {
  const userRef = db.collection('users').doc('user-123');
  const userDoc = await transaction.get(userRef);

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const currentPoints = userDoc.data()?.points || 0;
  transaction.update(userRef, {
    points: currentPoints + 10,
  });
});
```

### 5. Firebase Storage Operations

```typescript
import { getStorage } from 'firebase-admin/storage';

const storage = getStorage();
const bucket = storage.bucket();

// Upload file
const file = bucket.file('path/to/file.pdf');
await file.save(Buffer.from('file content'), {
  metadata: {
    contentType: 'application/pdf',
  },
});

// Make file public
await file.makePublic();

// Get public URL
const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

// Delete file
await file.delete();
```

## Test Infrastructure Integration

### Test Authentication Helper (testAuthSimple.ts)

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();

// Create test user
export async function generateTestUserToken(): Promise<{
  uid: string;
  email: string;
  token: string;
} | null> {
  try {
    const userRecord = await adminAuth.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'test-password-123',
    });

    const token = await adminAuth.createCustomToken(userRecord.uid);

    return {
      uid: userRecord.uid,
      email: userRecord.email!,
      token,
    };
  } catch (error) {
    console.error('Failed to create test user:', error);
    return null;
  }
}

// Cleanup test users
export async function cleanupTestUsers(): Promise<void> {
  const listUsersResult = await adminAuth.listUsers();
  const testUsers = listUsersResult.users.filter((user) => user.email?.startsWith('test-'));

  for (const user of testUsers) {
    await adminAuth.deleteUser(user.uid);
  }
}
```

## Best Practices

### 1. Singleton Initialization

Always check if Firebase Admin is already initialized to avoid errors:

```typescript
if (!getApps().length) {
  initializeApp({...});
}
```

### 2. Resource Cleanup

Always clean up test data in `afterAll()` hooks:

```typescript
afterAll(async () => {
  // Delete test documents
  for (const docId of testDocIds) {
    await db.collection('tests').doc(docId).delete();
  }
});
```

### 3. Error Handling

Wrap Admin SDK operations in try-catch blocks:

```typescript
try {
  await db.collection('users').doc('test-user').set({...});
} catch (error) {
  console.error('Failed to create test user:', error);
  throw error;
}
```

### 4. Private Key Handling

Always replace escaped newlines when using private keys from environment variables:

```typescript
privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
```

### 5. Test Data Isolation

Use unique identifiers for test data to avoid conflicts:

```typescript
const testId = `test-${Date.now()}`;
await db.collection('courses').doc(testId).set({...});
```

## Common Issues and Solutions

### Issue 1: "setImmediate is not defined"

**Problem**: Firebase Admin SDK's gRPC dependencies require `setImmediate` (Node.js API) in test environment.

**Solution**: Add polyfill to `jest.setup.js`:

```javascript
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args);
  global.clearImmediate = (id) => clearTimeout(id);
}
```

### Issue 2: "Cannot find module 'jose'"

**Problem**: Firebase Admin SDK v12+ uses `jose` for JWT operations, which can cause ESM/CommonJS conflicts.

**Solution**: Use Firebase REST API for authentication in tests instead of Admin SDK auth methods, or configure Jest to handle ESM modules properly.

### Issue 3: "Permission denied" errors

**Problem**: Regular Firebase client SDK respects security rules.

**Solution**: Use Firebase Admin SDK for test data setup/cleanup as it bypasses security rules:

```typescript
// ✅ Admin SDK (bypasses security rules)
await db.collection('users').doc('test-user').set({...});

// ❌ Client SDK (respects security rules)
await firebase.firestore().collection('users').doc('test-user').set({...});
```

### Issue 4: App already initialized

**Problem**: Attempting to initialize Firebase Admin multiple times in test suites.

**Solution**: Check if already initialized:

```typescript
if (!getApps().length) {
  initializeApp({...});
}
```

## Security Considerations

### 1. Never Commit Credentials

Add to `.gitignore`:

```
.env.local
.env.production
firebase-adminsdk-*.json
serviceAccountKey.json
```

### 2. Use Environment Variables

Store sensitive data in environment variables, never hardcode:

```typescript
// ✅ Good
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ❌ Bad
const projectId = 'my-actual-project-id';
```

### 3. Rotate Service Account Keys

Regularly rotate Firebase service account keys for security.

### 4. Limit Service Account Permissions

Grant only necessary permissions to service accounts in Firebase Console.

## Testing Workflow

### Complete Test Example

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const API_BASE_URL = 'http://localhost:33990';

// Track test data for cleanup
const testCourseIds: string[] = [];

describe('Course API Tests', () => {
  beforeAll(async () => {
    // Setup test data
    const courseId = `test-course-${Date.now()}`;
    await db.collection('courses').doc(courseId).set({
      name: 'Test Course',
      price: 49.99,
      createdAt: new Date().toISOString(),
    });
    testCourseIds.push(courseId);
  });

  afterAll(async () => {
    // Cleanup test data
    for (const courseId of testCourseIds) {
      await db.collection('courses').doc(courseId).delete();
    }
  });

  it('should retrieve course data', async () => {
    const courseId = testCourseIds[0];
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Test Course');
  });
});
```

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Admin API Reference](https://firebase.google.com/docs/firestore/server/overview)
- [Firebase Storage Admin API](https://firebase.google.com/docs/storage/admin/start)
- [Service Account Keys](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)

## Version Information

- Firebase Admin SDK: v12.x
- Node.js: v18+ recommended
- Jest: v29+ for testing
- Next.js: v14+ for API routes

## Support

For issues or questions, contact the development team or refer to the project's internal documentation.
