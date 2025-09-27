/**
 * Environment variable validation and security utilities
 * Ensures secure handling of API keys and configuration
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
}

// Required environment variables for the application
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Optional but recommended environment variables
const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_AZURE_SPEECH_API_KEY',
  'NEXT_PUBLIC_AZURE_REGION',
  'NEXT_PUBLIC_APP_NAME'
];

// Pattern validations for environment variables
const ENV_PATTERNS = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': /^AIza[0-9A-Za-z-_]{35}$/,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': /^[a-z0-9\-]+$/,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': /^[a-z0-9\-]+\.firebaseapp\.com$/,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': /^[a-z0-9\-]+\.appspot\.com$/,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': /^[0-9]+$/,
  'NEXT_PUBLIC_FIREBASE_APP_ID': /^1:[0-9]+:web:[a-f0-9]+$/
};

// Development/test values that should not be used in production
const DANGEROUS_VALUES = [
  'your_api_key',
  'your_firebase_api_key_here',
  'test',
  'development',
  'localhost',
  'example.com',
  'your_auth_domain_here',
  'your_project_id_here',
  'your_storage_bucket_here',
  'your_messaging_sender_id_here',
  'your_app_id_here',
  'your_measurement_id_here',
  'your_azure_speech_api_key_here',
  'your_azure_region_here'
];

/**
 * Validates environment variables for security and completeness
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];

  // Check required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    
    if (!value) {
      missing.push(varName);
      errors.push(`Missing required environment variable: ${varName}`);
      return;
    }

    // Check for dangerous placeholder values
    if (DANGEROUS_VALUES.some(dangerous => 
      value.toLowerCase().includes(dangerous.toLowerCase()))) {
      errors.push(`${varName} contains placeholder/development value: ${value}`);
    }

    // Validate format if pattern exists
    const pattern = ENV_PATTERNS[varName as keyof typeof ENV_PATTERNS];
    if (pattern && !pattern.test(value)) {
      errors.push(`${varName} has invalid format: ${value}`);
    }
  });

  // Check optional variables for placeholder values
  OPTIONAL_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    
    if (value && DANGEROUS_VALUES.some(dangerous => 
      value.toLowerCase().includes(dangerous.toLowerCase()))) {
      warnings.push(`${varName} appears to contain placeholder value: ${value}`);
    }
  });

  // Environment-specific checks
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    // Additional production checks
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (firebaseProjectId && firebaseProjectId.includes('test')) {
      warnings.push('Firebase project ID contains "test" - ensure this is correct for production');
    }

    // Check for development URLs
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    if (authDomain && authDomain.includes('localhost')) {
      errors.push('Firebase auth domain points to localhost in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing
  };
}

/**
 * Sanitizes environment variable for logging (masks sensitive parts)
 */
export function sanitizeEnvValue(key: string, value: string): string {
  if (!value) return '<empty>';
  
  // Always mask API keys
  if (key.toLowerCase().includes('api_key') || key.toLowerCase().includes('secret')) {
    if (value.length <= 8) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }

  // Mask parts of Firebase config that might be sensitive
  if (key.includes('FIREBASE_API_KEY')) {
    return value.substring(0, 8) + '***';
  }

  if (key.includes('MESSAGING_SENDER_ID')) {
    return value.substring(0, 3) + '***';
  }

  // For other values, just truncate if too long
  if (value.length > 50) {
    return value.substring(0, 25) + '...' + value.substring(value.length - 10);
  }

  return value;
}

/**
 * Logs environment validation results safely
 */
export function logEnvironmentValidation(): void {
  // SECURITY: Environment variable logging completely disabled
  // to prevent any accidental exposure of sensitive configuration
  // Validation still occurs silently for security checks
  
  if (typeof window !== 'undefined') {
    // Don't run on client side for security
    return;
  }

  // Perform validation silently - no logging to prevent information disclosure
  const validation = validateEnvironmentVariables();
  
  // All environment variable logging has been removed for security
  // Applications should handle missing variables gracefully at runtime
}

/**
 * Runtime environment check for critical security issues
 */
export function performSecurityChecks(): void {
  if (typeof window !== 'undefined') {
    // Client-side security checks
    
    // Check if development tools are open
    const devtools = /./;
    devtools.toString = function() {
      console.warn('⚠️ Developer tools detected. Ensure you trust this website.');
      return 'Developer tools detected';
    };
    console.log('%c', devtools);

    // Check for localhost in production
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1' &&
        window.location.protocol !== 'https:') {
      console.warn('⚠️ Application is not running over HTTPS in production');
    }

  } else {
    // Server-side security checks
    const validation = validateEnvironmentVariables();
    
    if (!validation.isValid) {
      console.error('🚨 CRITICAL: Environment validation failed. Application may not function correctly.');
      
      // In production, consider failing fast
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Critical environment validation failed');
      }
    }
  }
}

// Export the validation function for use in build processes
export { validateEnvironmentVariables as default };
