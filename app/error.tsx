'use client';

import DebugErrorPanel from '@/components/shared/DebugErrorPanel';

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <DebugErrorPanel error={error} reset={reset} scope="app" />;
}
