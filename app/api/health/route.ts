import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (
    !privateKey ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PROJECT_ID
  ) {
    console.warn('Firebase Admin credentials not configured for health check');
  } else {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
}

/**
 * Health Check Endpoint
 * Monitors system health and connectivity
 *
 * Returns:
 * - 200: All systems operational
 * - 503: Service unavailable (with details)
 */
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'up', message: 'API is running' },
      firebase: { status: 'unknown', message: '' },
      firestore: { status: 'unknown', message: '' },
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
  };

  let overallStatus = 200;

  // Check Firebase Admin connection
  try {
    const apps = getApps();
    if (!apps.length) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    healthCheck.services.firebase = {
      status: 'up',
      message: 'Firebase Admin SDK connected',
    };
  } catch (error) {
    healthCheck.services.firebase = {
      status: 'down',
      message: error instanceof Error ? error.message : 'Firebase connection failed',
    };
    healthCheck.status = 'degraded';
    overallStatus = 503;
  }

  // Check Firestore connectivity (lightweight query)
  try {
    const db = getFirestore();
    // Try to read a single document to verify Firestore is accessible
    // Using a minimal query to avoid creating test data
    const coursesRef = db.collection('courses');
    await coursesRef.limit(1).get();

    healthCheck.services.firestore = {
      status: 'up',
      message: 'Firestore queries operational',
    };
  } catch (error) {
    healthCheck.services.firestore = {
      status: 'down',
      message: error instanceof Error ? error.message : 'Firestore query failed',
    };
    healthCheck.status = 'degraded';
    overallStatus = 503;
  }

  // Return appropriate status code
  return NextResponse.json(healthCheck, {
    status: overallStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
