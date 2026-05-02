'use client';

import { useEffect, useState } from 'react';

import { subscribePublicConfig } from '@/utils/firebase/publicConfig';
import type { PublicConfig } from '@/types';

/**
 * Subscribe to the public, admin-managed runtime config (`config/public`).
 *
 * - `config` is `null` while loading and `{}` if the doc has not been created
 *   yet by an admin.
 * - Updates are pushed live via Firestore `onSnapshot`, so saving a new price
 *   ID in the admin UI is reflected immediately for everyone.
 *
 * Safe to call from any client component; reads are public per Firestore
 * rules (anonymous users included).
 */
export function usePublicConfig(): {
    config: PublicConfig | null;
    loading: boolean;
} {
    const [config, setConfig] = useState<PublicConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribePublicConfig(
            (next) => {
                setConfig(next);
                setLoading(false);
            },
            () => {
                // On permission/network error keep config as-is, but stop
                // showing a perpetual loading state so callers can fall back.
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };
    }, []);

    return { config, loading };
}
