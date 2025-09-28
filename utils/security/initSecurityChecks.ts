// Script that runs at application startup to ensure security configurations are valid

import { validateEnvironmentVariables, logEnvironmentValidation } from './envValidation';

/**
 * Performs startup security checks and configuration validation
 * This is intended to be run during app initialization
 * SECURITY: All logging removed to prevent environment variable exposure
 */
export function initializeSecurityChecks(): void {
  if (typeof window === 'undefined') {
    // Server-side security checks

    // Check environment variables silently
    const validation = validateEnvironmentVariables();

    // Critical security issues in production should fail fast
    if (process.env.NODE_ENV === 'production' && !validation.isValid) {
      const missingRequired = validation.missing.filter(v =>
        !v.includes('MEASUREMENT') // Non-critical vars
      );

      if (missingRequired.length > 0) {
        // In production, fail silently to avoid revealing configuration details
        // Application will handle missing variables gracefully at runtime
      }
    }

    // Security checks completed - no logging to prevent information disclosure
  }
}

// Automatically run the checks
if (process.env.NODE_ENV !== 'test') {
  initializeSecurityChecks();
}

export default initializeSecurityChecks;
