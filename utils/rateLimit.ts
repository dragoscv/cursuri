/**
 * Rate Limiting Utility
 *
 * Provides rate limiting functionality for API routes using Upstash Redis.
 * Protects against abuse, DDoS attacks, and brute force attempts.
 *
 * @module utils/rateLimit
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Initialize Redis client for rate limiting
 * Uses Upstash Redis REST API
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Rate limit configurations for different route types
 */
export const rateLimitConfigs = {
  // Authentication routes: 10 requests per 10 seconds per IP
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: '@upstash/ratelimit/auth',
      })
    : null,

  // API routes: 100 requests per hour per IP
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 h'),
        analytics: true,
        prefix: '@upstash/ratelimit/api',
      })
    : null,

  // Payment routes: 5 requests per minute per IP
  payment: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit/payment',
      })
    : null,

  // Enrollment routes: 20 requests per hour per IP
  enrollment: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 h'),
        analytics: true,
        prefix: '@upstash/ratelimit/enrollment',
      })
    : null,

  // Admin routes: 200 requests per hour per IP
  admin: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(200, '1 h'),
        analytics: true,
        prefix: '@upstash/ratelimit/admin',
      })
    : null,
};

/**
 * Rate limit type enum
 */
export type RateLimitType = keyof typeof rateLimitConfigs;

/**
 * Get client identifier from request (IP address or user ID)
 * @param request - Next.js request object
 * @returns Client identifier string
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session/token if available
  // Fallback to IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] ?? realIp ?? 'anonymous';

  return ip;
}

/**
 * Apply rate limiting to a request
 *
 * @param request - Next.js request object
 * @param type - Rate limit configuration type
 * @returns NextResponse if rate limited, null otherwise
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await rateLimit(request, 'auth');
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Process request...
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType
): Promise<NextResponse | null> {
  // If Redis is not configured, skip rate limiting (development mode)
  const limiter = rateLimitConfigs[type];
  if (!limiter) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Rate limiting is not configured in production!');
    }
    return null;
  }

  try {
    // Get client identifier
    const identifier = getClientIdentifier(request);

    // Check rate limit
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', reset.toString());

    // If rate limited, return 429 response
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter: retryAfter,
          resetAt: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Rate limit not exceeded, return null (continue processing)
    return null;
  } catch (error) {
    // If rate limiting fails, log error but don't block request
    console.error('Rate limiting error:', error);
    return null;
  }
}

/**
 * Rate limit middleware wrapper for API routes
 *
 * @param handler - API route handler function
 * @param type - Rate limit configuration type
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   'auth'
 * );
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request, type);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Continue to handler
    return handler(request);
  };
}

/**
 * Check if rate limiting is properly configured
 * @returns true if Redis is configured, false otherwise
 */
export function isRateLimitConfigured(): boolean {
  return redis !== null;
}

/**
 * Get rate limit status for a client
 *
 * @param request - Next.js request object
 * @param type - Rate limit configuration type
 * @returns Rate limit status information
 */
export async function getRateLimitStatus(
  request: NextRequest,
  type: RateLimitType
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} | null> {
  const limiter = rateLimitConfigs[type];
  if (!limiter) return null;

  try {
    const identifier = getClientIdentifier(request);
    const result = await limiter.limit(identifier);
    return result;
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
}
