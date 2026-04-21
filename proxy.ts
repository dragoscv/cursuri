import { NextResponse, type NextRequest } from 'next/server';
import { validateApiRequest, addSecurityHeaders } from '@/utils/security/apiSecurity';
import { validateEnvironmentVariables } from '@/utils/security/envValidation';

/**
 * Security middleware only - NO URL-based i18n routing
 *
 * Locale is determined purely from cookies in i18n/request.ts
 * - Protects API routes with security validation
 * - Applies comprehensive security headers to all requests
 */
export async function proxy(request: NextRequest) {
  // Initialize response
  const response = NextResponse.next();

  // Apply comprehensive Content Security Policy
  // This is the SINGLE source of truth for CSP headers
  // Dynamically construct Firebase Storage URL from environment variables
  const firebaseStorageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cursuri-411b4.appspot.com';
  const firebaseStorageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseStorageBucket}`;

  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com https://apis.google.com https://accounts.google.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.googleapis.com https://www.google.com https://www.gstatic.com https://connect.facebook.net https://analytics.tiktok.com https://www.clarity.ms https://*.clarity.ms",
    "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com https://apis.google.com https://accounts.google.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.googleapis.com https://www.google.com https://www.gstatic.com https://connect.facebook.net https://analytics.tiktok.com https://www.clarity.ms https://*.clarity.ms",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `media-src 'self' blob: data: https://firebasestorage.googleapis.com ${firebaseStorageUrl} https://storage.googleapis.com`,
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com https://api.stripe.com wss://*.firebaseio.com https://accounts.google.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.cloudfunctions.net https://www.google.com https://connect.facebook.net https://*.facebook.com https://analytics.tiktok.com https://*.tiktok.com https://*.tiktokw.us https://*.clarity.ms",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://*.firebaseapp.com https://www.google.com https://recaptcha.google.com https://www.recaptcha.net",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  // Apply additional security headers
  addSecurityHeaders(response.headers);

  // Harden admin routes: never cache, never index. Auth/role enforcement remains in AdminGuard
  // (Firebase Auth uses IndexedDB tokens client-side, so a proxy-level token check is not feasible
  // without introducing Firebase session cookies).
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Referrer-Policy', 'no-referrer');
  }

  // For API routes, perform additional validation
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Check environment variables are properly configured
    if (process.env.NODE_ENV === 'production') {
      const envValidation = validateEnvironmentVariables();

      if (!envValidation.isValid) {
        console.error(
          '⚠️ API accessed with invalid environment configuration:',
          envValidation.errors.join(', ')
        );
      }
    }

    // Validate API request format
    const validation = validateApiRequest(request);

    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({
          error: 'Bad Request',
          message: validation.error || 'Invalid request format',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Add API-specific headers
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

// Configure the paths this middleware applies to
export const config = {
  matcher: [
    // Apply to all routes for CSP headers
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
