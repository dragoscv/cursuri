'use client';

import { usePathname } from 'next/navigation';
import DebugErrorPanel from '@/components/shared/DebugErrorPanel';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const pathname = usePathname();
    return (
        <DebugErrorPanel
            error={error}
            reset={reset}
            scope={`admin · ${pathname || 'unknown'}`}
            title="An admin page failed to load"
        />
    );
}
