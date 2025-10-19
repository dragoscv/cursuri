/**
 * API Authentication and Authorization Utilities
 * 
 * This module provides middleware-style functions for securing Next.js API routes
 * with Firebase Authentication and role-based access control.
 * 
 * @module utils/api/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { UserRole } from '../firebase/adminAuth';

/**
 * Decoded user information from Firebase ID token
 */
export interface AuthenticatedUser {
    uid: string;
    email?: string;
    emailVerified: boolean;
    role: UserRole;
    permissions?: Record<string, boolean>;
}

/**
 * Authentication result with user data or error
 */
export interface AuthResult {
    success: boolean;
    user?: AuthenticatedUser;
    error?: string;
    statusCode?: number;
}

/**
 * Initialize Firebase Admin SDK if not already initialized
 * Skip during build time or when credentials aren't available
 */
function initializeFirebaseAdmin(): void {
    const isBuild = process.env.NODE_ENV !== 'production' || !process.env.FIREBASE_PRIVATE_KEY;
    
    if (!getApps().length) {
        try {
            if (!isBuild) {
                initializeApp({
                    credential: cert({
                        projectId: process.env.FIREBASE_PROJECT_ID || '',
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
                        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
                    }),
                });
            } else {
                // For build time, use a minimal configuration
                initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project-id',
                });
            }
        } catch (error) {
            console.error("Failed to initialize Firebase Admin:", error);
        }
    }
}

/**
 * Extract and verify Firebase ID token from request Authorization header
 * 
 * @param request - Next.js request object
 * @returns Authentication result with user data or error
 * 
 * @example
 * ```typescript
 * const authResult = await verifyAuthentication(request);
 * if (!authResult.success) {
 *   return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode });
 * }
 * const user = authResult.user;
 * ```
 */
export async function verifyAuthentication(request: NextRequest): Promise<AuthResult> {
    try {
        // Initialize Firebase Admin if needed
        initializeFirebaseAdmin();

        // Check if we're in build mode
        const isBuild = process.env.NODE_ENV !== 'production' || !process.env.FIREBASE_PRIVATE_KEY;
        if (isBuild) {
            // During build, return a mock success for type checking
            return {
                success: false,
                error: 'Build mode - authentication disabled',
                statusCode: 503
            };
        }

        // Extract Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return {
                success: false,
                error: 'Missing Authorization header',
                statusCode: 401
            };
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token || token === authHeader) {
            return {
                success: false,
                error: 'Invalid Authorization header format. Expected: Bearer <token>',
                statusCode: 401
            };
        }

        // Verify the ID token
        const decodedToken = await getAuth().verifyIdToken(token);

        // Get user profile from Firestore to check role and permissions
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        
        let role = UserRole.USER;
        let permissions: Record<string, boolean> = {};

        if (userDoc.exists) {
            const userData = userDoc.data();
            role = userData?.role || UserRole.USER;
            permissions = userData?.permissions || {};
        }

        return {
            success: true,
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified || false,
                role: role,
                permissions: permissions
            }
        };

    } catch (error: unknown) {
        console.error('Authentication error:', error);
        
        // Handle specific Firebase auth errors
        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                return {
                    success: false,
                    error: 'Token has expired. Please sign in again.',
                    statusCode: 401
                };
            }
            if (error.message.includes('invalid')) {
                return {
                    success: false,
                    error: 'Invalid authentication token',
                    statusCode: 401
                };
            }
        }

        return {
            success: false,
            error: 'Authentication failed',
            statusCode: 401
        };
    }
}

/**
 * Verify that the authenticated user has admin privileges
 * 
 * @param user - Authenticated user object
 * @returns True if user is admin or super admin, false otherwise
 */
export function isAdmin(user: AuthenticatedUser): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
}

/**
 * Verify that the authenticated user has super admin privileges
 * 
 * @param user - Authenticated user object
 * @returns True if user is super admin, false otherwise
 */
export function isSuperAdmin(user: AuthenticatedUser): boolean {
    return user.role === UserRole.SUPER_ADMIN;
}

/**
 * Verify that the authenticated user has a specific permission
 * 
 * @param user - Authenticated user object
 * @param permission - Permission key to check
 * @returns True if user has the permission, false otherwise
 */
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
    return user.permissions?.[permission] === true;
}

/**
 * Middleware to require authentication for an API route
 * Returns 401 if not authenticated
 * 
 * @param request - Next.js request object
 * @returns Authentication result or error response
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const authResult = await requireAuth(request);
 *   if (authResult instanceof NextResponse) return authResult; // Error response
 *   
 *   const user = authResult.user;
 *   // Continue with authenticated request...
 * }
 * ```
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
    const authResult = await verifyAuthentication(request);
    
    if (!authResult.success) {
        return NextResponse.json(
            { error: authResult.error || 'Authentication required' },
            { status: authResult.statusCode || 401 }
        );
    }
    
    return authResult;
}

/**
 * Middleware to require admin role for an API route
 * Returns 401 if not authenticated, 403 if not admin
 * 
 * @param request - Next.js request object
 * @returns Authentication result or error response
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const authResult = await requireAdmin(request);
 *   if (authResult instanceof NextResponse) return authResult; // Error response
 *   
 *   const user = authResult.user;
 *   // Continue with admin request...
 * }
 * ```
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
    const authResult = await verifyAuthentication(request);
    
    if (!authResult.success) {
        return NextResponse.json(
            { error: authResult.error || 'Authentication required' },
            { status: authResult.statusCode || 401 }
        );
    }
    
    if (!authResult.user || !isAdmin(authResult.user)) {
        return NextResponse.json(
            { error: 'Admin access required. You do not have sufficient permissions.' },
            { status: 403 }
        );
    }
    
    return authResult;
}

/**
 * Middleware to require super admin role for an API route
 * Returns 401 if not authenticated, 403 if not super admin
 * 
 * @param request - Next.js request object
 * @returns Authentication result or error response
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
    const authResult = await verifyAuthentication(request);
    
    if (!authResult.success) {
        return NextResponse.json(
            { error: authResult.error || 'Authentication required' },
            { status: authResult.statusCode || 401 }
        );
    }
    
    if (!authResult.user || !isSuperAdmin(authResult.user)) {
        return NextResponse.json(
            { error: 'Super admin access required. You do not have sufficient permissions.' },
            { status: 403 }
        );
    }
    
    return authResult;
}

/**
 * Verify that the authenticated user owns the resource or is an admin
 * 
 * @param user - Authenticated user object
 * @param resourceUserId - User ID that owns the resource
 * @returns True if user owns the resource or is admin
 */
export function canAccessResource(user: AuthenticatedUser, resourceUserId: string): boolean {
    return user.uid === resourceUserId || isAdmin(user);
}

/**
 * Create a standardized error response for unauthorized access
 * 
 * @param message - Optional custom error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message?: string): NextResponse {
    return NextResponse.json(
        { error: message || 'Unauthorized. Please sign in to access this resource.' },
        { status: 401 }
    );
}

/**
 * Create a standardized error response for forbidden access
 * 
 * @param message - Optional custom error message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message?: string): NextResponse {
    return NextResponse.json(
        { error: message || 'Forbidden. You do not have permission to access this resource.' },
        { status: 403 }
    );
}

/**
 * Rate limiting data structure (in-memory, for demonstration)
 * In production, use Redis or similar distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting function
 * 
 * @param identifier - Unique identifier (e.g., user ID or IP)
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns True if request is allowed, false if rate limit exceeded
 * 
 * @example
 * ```typescript
 * const allowed = checkRateLimit(user.uid, 10, 60000); // 10 requests per minute
 * if (!allowed) {
 *   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute default
): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
        // Create new record or reset expired one
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (record.count >= maxRequests) {
        return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    rateLimitStore.set(identifier, record);
    return true;
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    rateLimitStore.forEach((record, key) => {
        if (now > record.resetTime) {
            keysToDelete.push(key);
        }
    });
    
    keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Clean up rate limit store every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
