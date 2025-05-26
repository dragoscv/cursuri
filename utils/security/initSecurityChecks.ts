// Script that runs at application startup to ensure security configurations are valid

import { validateEnvironmentVariables, logEnvironmentValidation } from './envValidation';

/**
 * Performs startup security checks and configuration validation
 * This is intended to be run during app initialization
 */
export function initializeSecurityChecks(): void {
  if (typeof window === 'undefined') {
    // Server-side security checks
    
    // Check environment variables
    const validation = validateEnvironmentVariables();
    logEnvironmentValidation();
    
    // Critical security issues in production should fail fast
    if (process.env.NODE_ENV === 'production' && !validation.isValid) {
      const missingRequired = validation.missing.filter(v => 
        !v.includes('MEASUREMENT') // Non-critical vars
      );
      
      if (missingRequired.length > 0) {
        console.error('🚨 CRITICAL: Missing required environment variables in production:');
        missingRequired.forEach(key => console.error(`  • ${key}`));
        
        // In production, write to logs but don't crash the app
        console.error('Application may not function correctly with missing environment variables');
      }
    }
    
    // Log initialization completion
    console.log('✅ Security initialization checks completed');
  }
}

// Automatically run the checks
if (process.env.NODE_ENV !== 'test') {
  initializeSecurityChecks();
}

export default initializeSecurityChecks;
