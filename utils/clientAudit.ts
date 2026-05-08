/**
 * Client-side audit log helper.
 * Posts auth + activity events to /api/audit/auth-event so they land in
 * the server-side `audit_logs` Firestore collection alongside server events.
 *
 * Fire-and-forget: failures are silenced so they never break the calling flow.
 */

type AuthEventAction =
    | 'login'
    | 'logout'
    | 'registration'
    | 'password_reset'
    | 'password_changed'
    | 'email_verification'
    | 'token_refresh';

interface ClientAuthUser {
    uid?: string | null;
    email?: string | null;
}

export async function logClientAuthEvent(
    action: AuthEventAction,
    user?: ClientAuthUser | null,
    success: boolean = true,
    errorMessage?: string
): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        await fetch('/api/audit/auth-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                userId: user?.uid || undefined,
                email: user?.email || undefined,
                success,
                errorMessage,
            }),
            keepalive: true,
        });
    } catch {
        // Silent — audit logging must never break user-facing flows.
    }
}
