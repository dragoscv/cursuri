'use client';

import { useEffect, useState } from 'react';
import { validateEnvironmentVariables, type EnvValidationResult } from '@/utils/security/envValidation';

interface SecurityInitializerProps {
  children: React.ReactNode;
}

export default function SecurityInitializer({ children }: SecurityInitializerProps) {
  const [securityStatus, setSecurityStatus] = useState<{
    isValidated: boolean;
    hasErrors: boolean;
  }>({
    isValidated: false,
    hasErrors: false,
  });

  useEffect(() => {
    // Only check in development mode
    if (process.env.NODE_ENV !== 'development') {
      setSecurityStatus({ isValidated: true, hasErrors: false });
      return;
    }

    try {
      // Run environment validation
      const validation: EnvValidationResult = validateEnvironmentVariables();
      
      // Set validation status
      setSecurityStatus({
        isValidated: true,
        hasErrors: validation.errors.length > 0,
      });

      // Log security warnings/errors in developer console only
      if (validation.errors.length > 0) {
        console.error('🚨 SECURITY CONFIGURATION ERRORS:');
        validation.errors.forEach(error => console.error(`  • ${error}`));
        
        // Add a visible console message that's easy to spot
        console.error('%c ⚠️ SECURITY ISSUES DETECTED - See .env.example file for proper configuration', 
          'background: #FEF2F2; color: #B91C1C; font-weight: bold; font-size: 14px; padding: 5px; border-radius: 5px;');
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Security Configuration Warnings:');
        validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
      }
    } catch (error) {
      console.error('Failed to initialize security checks:', error);
      setSecurityStatus({ isValidated: true, hasErrors: true });
    }
  }, []);

  if (!securityStatus.isValidated) {
    return null; // Or a loading state if preferred
  }

  // In development mode, show a warning banner if security issues exist
  if (process.env.NODE_ENV === 'development' && securityStatus.hasErrors) {
    return (
      <>
        <div className="bg-red-600 text-white text-sm py-1 px-4 text-center relative">
          <strong>⚠️ Security Configuration Issues Detected</strong> - Check browser console for details and update your .env.local file
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
