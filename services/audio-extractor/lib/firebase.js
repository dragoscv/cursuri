import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let initialized = false;

export function ensureFirebase() {
    if (initialized) return;
    if (getApps().length) {
        initialized = true;
        return;
    }

    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
        throw new Error('FIREBASE_STORAGE_BUCKET (or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) env var must be set');
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket,
        });
    } else {
        // Cloud Run service account — works in-cluster without explicit creds.
        initializeApp({
            credential: applicationDefault(),
            storageBucket,
            projectId: projectId || process.env.GOOGLE_CLOUD_PROJECT,
        });
    }
    initialized = true;
}

export { getFirestore, getStorage, FieldValue };
