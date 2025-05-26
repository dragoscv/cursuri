import { useState, useEffect, useCallback } from 'react';
import { validatePassword, type PasswordValidationResult, type PasswordRequirements, DEFAULT_PASSWORD_REQUIREMENTS } from './passwordValidation';

/**
 * React hook for password validation with real-time feedback
 * 
 * @param initialPassword - Initial password string (optional)
 * @param customRequirements - Custom password requirements (optional)
 * @returns Password validation state and helper functions
 */
export function usePasswordValidation(
  initialPassword: string = '', 
  customRequirements?: Partial<PasswordRequirements>
) {
  const [password, setPassword] = useState<string>(initialPassword);
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);
  const [requirements] = useState<PasswordRequirements>({
    ...DEFAULT_PASSWORD_REQUIREMENTS,
    ...customRequirements
  });

  // Validate password whenever it changes
  useEffect(() => {
    if (password) {
      const result = validatePassword(password, requirements);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [password, requirements]);

  /**
   * Get password strength information for UI presentation
   */
  const getStrengthInfo = useCallback(() => {
    if (!validation) {
      return {
        color: '#9CA3AF', // Gray
        label: 'Not set',
        percentage: 0
      };
    }

    const colors = {
      weak: '#EF4444', // Red
      medium: '#F59E0B', // Yellow/Amber
      strong: '#10B981'  // Green
    };

    const labels = {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong'
    };

    return {
      color: colors[validation.strength],
      label: labels[validation.strength],
      percentage: Math.min(100, (validation.score / 6) * 100)
    };
  }, [validation]);

  /**
   * Generate a list of password requirements with their satisfaction status
   */
  const getRequirementsList = useCallback(() => {
    const reqs = [
      {
        id: 'length',
        label: `At least ${requirements.minLength} characters`,
        satisfied: !!password && password.length >= requirements.minLength
      },
      {
        id: 'uppercase',
        label: 'At least one uppercase letter',
        satisfied: requirements.requireUppercase ? !!password && /[A-Z]/.test(password) : true
      },
      {
        id: 'lowercase',
        label: 'At least one lowercase letter',
        satisfied: requirements.requireLowercase ? !!password && /[a-z]/.test(password) : true
      },
      {
        id: 'number',
        label: 'At least one number',
        satisfied: requirements.requireNumbers ? !!password && /[0-9]/.test(password) : true
      },
      {
        id: 'special',
        label: 'At least one special character',
        satisfied: requirements.requireSpecialChars 
          ? !!password && /[!@#$%^&*(),.?":{}|<>]/.test(password) 
          : true
      }
    ];

    return reqs;
  }, [password, requirements]);

  return {
    password,
    setPassword,
    validation,
    isValid: validation?.isValid || false,
    strength: validation?.strength || 'weak',
    errors: validation?.errors || [],
    score: validation?.score || 0,
    getStrengthInfo,
    getRequirementsList
  };
}
