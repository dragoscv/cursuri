'use client';

import DebugErrorPanel from '@/components/shared/DebugErrorPanel';
import '@/app/globals.css';

/**
 * Last-resort error boundary. Renders when even the root layout itself throws,
 * so we have to provide our own <html> and <body>. Keep dependencies minimal.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="bg-[rgb(var(--background-start-rgb))]">
                <DebugErrorPanel
                    error={error}
                    reset={reset}
                    scope="global"
                    title="The app crashed"
                />
            </body>
        </html>
    );
}
