// API Security Utilities

/**
 * Sanitizes sensitive information for logging
 * @param data - Data object potentially containing sensitive information
 * @returns Sanitized data safe for logging
 */
export function sanitizeDataForLogging(data: any): any {
  if (!data) return data;
  
  // Handle primitive types
  if (typeof data !== 'object') return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(sanitizeDataForLogging);
  }
  
  // Handle objects
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Sanitize keys that might contain sensitive information
    if (isSensitiveKey(key)) {
      sanitized[key] = maskSensitiveValue(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeDataForLogging(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

/**
 * Check if a key potentially contains sensitive information
 */
function isSensitiveKey(key: string): boolean {
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'apiKey', 'api_key', 
    'credential', 'auth', 'private', 'cvv', 'credit', 'card',
    'social', 'ssn', 'fiscal', 'idNumber'
  ];
  
  return sensitiveKeys.some(sensitiveKey => 
    key.toLowerCase().includes(sensitiveKey.toLowerCase())
  );
}

/**
 * Mask sensitive values
 */
function maskSensitiveValue(value: any): string {
  if (value === null || value === undefined) return '[null]';
  
  const stringValue = String(value);
  if (stringValue.length <= 4) return '***';
  
  return `${stringValue.substring(0, 2)}***${stringValue.substring(stringValue.length - 2)}`;
}

/**
 * Add security headers to API responses
 * @param headers - Response headers object
 */
export function addSecurityHeaders(headers: Headers): void {
  // Security headers according to OWASP recommendations
  headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com;");
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Prevent caching of sensitive data
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
}

/**
 * Validate API request to prevent common attacks
 */
export function validateApiRequest(request: Request): { isValid: boolean; error?: string } {
  const contentType = request.headers.get('Content-Type');
  const contentLength = request.headers.get('Content-Length');
  
  // Validate content type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (!contentType || 
        (!contentType.includes('application/json') && 
         !contentType.includes('multipart/form-data') &&
         !contentType.includes('application/x-www-form-urlencoded'))) {
      return { 
        isValid: false, 
        error: `Invalid Content-Type: ${contentType || 'not provided'}` 
      };
    }
    
    // Validate payload size to prevent DoS
    const size = parseInt(contentLength || '0', 10);
    if (size > 10 * 1024 * 1024) { // 10MB limit
      return {
        isValid: false,
        error: 'Payload too large'
      };
    }
  }
  
  return { isValid: true };
}
