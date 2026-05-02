/**
 * Public, admin-managed runtime configuration helpers.
 *
 * Stored in Firestore at `config/public`. The document is readable by anyone
 * (so the unauthenticated checkout client can read Stripe price IDs) but
 * writable only by admins. NEVER write secrets here.
 *
 * See: `firestore.rules` (`match /config/{document=**}`),
 *      `types/index.d.ts` (`PublicConfig`).
 */

import {
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    type Unsubscribe,
} from 'firebase/firestore';

import { firestoreDB } from './firebase.config';
import type { PublicConfig } from '@/types';

const PUBLIC_CONFIG_PATH = 'config/public';

/**
 * Fetch the public config document once. Returns an empty object if the
 * document does not exist yet (treat as "not configured").
 */
export async function getPublicConfig(): Promise<PublicConfig> {
    const ref = doc(firestoreDB, PUBLIC_CONFIG_PATH);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as PublicConfig) : {};
}

/**
 * Subscribe to live updates of the public config document.
 * Calls `onChange` immediately with the current value (or `{}` if missing).
 * Returns the unsubscribe function — caller is responsible for cleanup.
 */
export function subscribePublicConfig(
    onChange: (config: PublicConfig) => void,
    onError?: (err: unknown) => void
): Unsubscribe {
    const ref = doc(firestoreDB, PUBLIC_CONFIG_PATH);
    return onSnapshot(
        ref,
        (snap) => {
            onChange(snap.exists() ? (snap.data() as PublicConfig) : {});
        },
        (err) => {
            // Permission errors here are unexpected because the doc is publicly
            // readable, but stay defensive (e.g. offline, transient).
            console.error('[publicConfig] snapshot error', err);
            if (onError) onError(err);
        }
    );
}

/**
 * Update the public config document. Only callable by admins (enforced by
 * Firestore rules). Merges the patch into the existing document and stamps
 * `updatedAt` / `updatedBy`.
 *
 * @throws if the caller is not an admin (Firestore will reject the write).
 */
export async function updatePublicConfig(
    patch: Partial<PublicConfig>,
    updatedByUid: string | null | undefined
): Promise<void> {
    const ref = doc(firestoreDB, PUBLIC_CONFIG_PATH);
    await setDoc(
        ref,
        {
            ...patch,
            updatedAt: serverTimestamp(),
            ...(updatedByUid ? { updatedBy: updatedByUid } : {}),
        },
        { merge: true }
    );
}

/**
 * Resolve the GitHub subscription price ID, preferring admin-managed config.
 * Falls back to the `NEXT_PUBLIC_STRIPE_GITHUB_PRICE_ID` env var (legacy) so
 * existing deployments keep working until an admin saves a value.
 */
export function resolveGithubPriceId(config: PublicConfig | null | undefined): string {
    const fromConfig = config?.stripe?.githubPriceId?.trim();
    if (fromConfig) return fromConfig;
    return process.env.NEXT_PUBLIC_STRIPE_GITHUB_PRICE_ID || '';
}
