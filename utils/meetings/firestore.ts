/**
 * Server-side Firestore helpers for the meetings feature.
 * Uses firebase-admin SDK. Only import from API route handlers.
 */
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import type { Meeting, MeetingsConfig } from '@/types/meetings';
import { DEFAULT_MEETINGS_CONFIG } from './config';

export const MEETINGS_COLLECTION = 'meetings';
export const MEETINGS_CONFIG_COLLECTION = 'meetingsConfig';
export const MEETINGS_CONFIG_DOC = 'global';

function ensureAdminInit() {
  if (getApps().length) return;
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function getMeetingsConfig(): Promise<MeetingsConfig> {
  ensureAdminInit();
  const db = getFirestore();
  const snap = await db.collection(MEETINGS_CONFIG_COLLECTION).doc(MEETINGS_CONFIG_DOC).get();
  if (!snap.exists) return { ...DEFAULT_MEETINGS_CONFIG };
  return { ...DEFAULT_MEETINGS_CONFIG, ...(snap.data() as Partial<MeetingsConfig>) } as MeetingsConfig;
}

export async function setMeetingsConfig(
  partial: Partial<MeetingsConfig>,
  updatedBy: string
): Promise<MeetingsConfig> {
  ensureAdminInit();
  const db = getFirestore();
  const ref = db.collection(MEETINGS_CONFIG_COLLECTION).doc(MEETINGS_CONFIG_DOC);
  const current = await getMeetingsConfig();
  const merged: MeetingsConfig = {
    ...current,
    ...partial,
    updatedAt: Date.now(),
    updatedBy,
  };
  await ref.set(merged, { merge: true });
  return merged;
}

/**
 * Fetch existing busy meetings within [fromMs, toMs] for slot computation.
 * Includes confirmed + pending_payment so we don't double-book during checkout windows.
 */
export async function fetchBusyMeetings(
  fromMs: number,
  toMs: number
): Promise<Pick<Meeting, 'id' | 'startAt' | 'endAt' | 'status'>[]> {
  ensureAdminInit();
  const db = getFirestore();
  const snap = await db
    .collection(MEETINGS_COLLECTION)
    .where('status', 'in', ['confirmed', 'pending_payment'])
    .where('startAt', '<', toMs)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((m) => m.endAt > fromMs);
}

export async function createMeetingDoc(data: Omit<Meeting, 'id'>): Promise<string> {
  ensureAdminInit();
  const db = getFirestore();
  const ref = await db.collection(MEETINGS_COLLECTION).add(data);
  return ref.id;
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  ensureAdminInit();
  const db = getFirestore();
  const snap = await db.collection(MEETINGS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as any) } as Meeting;
}

export async function updateMeeting(id: string, patch: Partial<Meeting>): Promise<void> {
  ensureAdminInit();
  const db = getFirestore();
  await db
    .collection(MEETINGS_COLLECTION)
    .doc(id)
    .set({ ...patch, updatedAt: Date.now() }, { merge: true });
}

export async function listUserMeetings(userId: string, limit = 50): Promise<Meeting[]> {
  ensureAdminInit();
  const db = getFirestore();
  const snap = await db
    .collection(MEETINGS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('startAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Meeting));
}

export async function listAllMeetings(opts?: {
  status?: string;
  limit?: number;
  fromMs?: number;
}): Promise<Meeting[]> {
  ensureAdminInit();
  const db = getFirestore();
  let q: FirebaseFirestore.Query = db.collection(MEETINGS_COLLECTION);
  if (opts?.status && opts.status !== 'all') q = q.where('status', '==', opts.status);
  if (opts?.fromMs) q = q.where('startAt', '>=', opts.fromMs);
  q = q.orderBy('startAt', 'desc').limit(opts?.limit ?? 200);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Meeting));
}

/** Check if user has an active subscription via Firewand customers/subscriptions. */
export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  ensureAdminInit();
  const db = getFirestore();
  const snap = await db
    .collection('customers')
    .doc(userId)
    .collection('subscriptions')
    .where('status', 'in', ['active', 'trialing'])
    .limit(1)
    .get();
  return !snap.empty;
}
