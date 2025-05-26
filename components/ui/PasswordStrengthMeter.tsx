'use client';

import React from 'react';
import { validatePassword, type PasswordValidationResult } from '@/utils/security/passwordValidation';
import { usePasswordValidation } from '@/utils/security/usePasswordValidation';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
  showErrors?: boolean;
  maxErrorsShown?: number;
}

/**
 * Password Strength Meter Component
 * Displays password strength and validation errors
 */
export default function PasswordStrengthMeter({
  password,
  className = '',
  showRequirements = true,
  showErrors = true,
  maxErrorsShown = 2
}: PasswordStrengthMeterProps) {
  const {
    validation,
    getStrengthInfo,
    getRequirementsList
  } = usePasswordValidation(password);

  // Don't show anything if no password
  if (!password) {
    return null;
  }

  const strengthInfo = getStrengthInfo();
  const requirementsList = getRequirementsList();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength label */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          Password Strength: <span className="font-semibold" style={{ color: strengthInfo.color }}>
            {strengthInfo.label}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div 
          className="h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${Math.max(4, strengthInfo.percentage)}%`,
            backgroundColor: strengthInfo.color
          }}
        ></div>
      </div>
      
      {/* Requirements list */}
      {showRequirements && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs mt-2">
          {requirementsList.map(req => (
            <li key={req.id} className="flex items-center">
              <span className={`mr-1 text-sm ${req.satisfied ? 'text-green-500' : 'text-gray-400'}`}>
                {req.satisfied ? '✓' : '○'}
              </span>
              <span className={req.satisfied ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      )}
      
      {/* Errors */}
      {showErrors && validation && validation.errors.length > 0 && (
        <ul className="text-sm text-red-500 mt-1 space-y-1 list-disc pl-4">
          {validation.errors.slice(0, maxErrorsShown).map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
          {validation.errors.length > maxErrorsShown && (
            <li>+{validation.errors.length - maxErrorsShown} more issues</li>
          )}
        </ul>
      )}
    </div>
  );
}
