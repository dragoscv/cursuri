import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent } from '@/utils/auditLog';
import { UserRole } from '@/utils/firebase/adminAuth';

/**
 * POST /api/audit/auth-event
 *
 * Client-side endpoint for logging authentication events from the browser.
 *
 * Since Firebase Auth is client-side only (no server-side auth API routes),
 * this endpoint receives auth events from the frontend and logs them to Firestore.
 *
 * Events logged:
 * - login: User successfully signed in
 * - logout: User signed out
 * - registration: New user account created
 * - password_reset: Password reset requested
 * - password_changed: Password successfully changed
 * - email_verification: Email verification sent/completed
 *
 * Security: This endpoint is public (no auth required) but validates data
 * to prevent abuse. Rate limiting is handled by Upstash Redis.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, email, success, errorMessage } = body;

    // Validate required fields
    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid action field' }, { status: 400 });
    }

    // Validate action type
    const validActions = [
      'login',
      'logout',
      'registration',
      'password_reset',
      'password_changed',
      'email_verification',
      'token_refresh',
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Create user object if userId and email provided
    const user =
      userId && email
        ? {
            uid: userId,
            email,
            emailVerified: true, // Assume verified for logging purposes
            role: 'user' as UserRole, // Default role, actual role not critical for auth events
          }
        : undefined;

    // Log the authentication event
    try {
      await logAuthEvent(
        action,
        request,
        user,
        success !== false, // Default to true if not specified
        errorMessage
      );
    } catch (logError) {
      // Fail-open: Don't break the auth flow if logging fails
      console.error('Auth event logging failed (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication event logged successfully',
    });
  } catch (error) {
    console.error('Auth event endpoint error:', error);

    // Return success even on error to prevent breaking auth flow
    return NextResponse.json(
      {
        success: true,
        message: 'Event received (logging failed silently)',
      },
      { status: 200 } // Return 200 to not break client-side flow
    );
  }
}
