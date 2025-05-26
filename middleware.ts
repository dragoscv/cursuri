import { NextResponse, type NextRequest } from 'next/server';
import { validateApiRequest, addSecurityHeaders } from '@/utils/security/apiSecurity';
import { validateEnvironmentVariables } from '@/utils/security/envValidation';

/**
 * Security middleware to protect API routes
 * Applies validation and security headers to all API requests
 */
export async function middleware(request: NextRequest) {
  // Skip middleware in development for non-API routes to improve DX
  if (process.env.NODE_ENV === 'development' && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Initialize response
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  addSecurityHeaders(response.headers);
  
  // For API routes, perform additional validation
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Check environment variables are properly configured
    if (process.env.NODE_ENV === 'production') {
      const envValidation = validateEnvironmentVariables();
      
      if (!envValidation.isValid) {
        console.error('⚠️ API accessed with invalid environment configuration:', 
          envValidation.errors.join(', '));
      }
    }
    
    // Validate API request format
    const validation = validateApiRequest(request);
    
    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: validation.error || 'Invalid request format'
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
    // API routes
    '/api/:path*',
    // Authentication routes
    '/auth/:path*',
    // Protected routes
    '/profile/:path*',
    '/admin/:path*',
  ],
};
