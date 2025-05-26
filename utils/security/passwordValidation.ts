/**
 * Password validation utilities for enhanced security
 * Implements strong password requirements as per security audit recommendations
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength: number;
  preventCommonPasswords: boolean;
}

// Default password requirements (configurable)
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  preventCommonPasswords: true,
};

// Common weak passwords to prevent
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'cursuri', 'cursuri123', 'admin123', 'test123', 'user123'
];

/**
 * Validates password against security requirements
 */
export function validatePassword(
  password: string, 
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  } else {
    score += 1;
  }

  if (password.length > requirements.maxLength) {
    errors.push(`Password must not exceed ${requirements.maxLength} characters`);
  }

  // Character type requirements
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (requirements.requireUppercase) {
    score += 1;
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (requirements.requireLowercase) {
    score += 1;
  }

  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (requirements.requireNumbers) {
    score += 1;
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  } else if (requirements.requireSpecialChars) {
    score += 1;
  }

  // Common password check
  if (requirements.preventCommonPasswords && 
      COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more unique password');
  }

  // Additional strength checks
  if (password.length >= 12) score += 1;
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
    score -= 1;
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4 && errors.length === 0) {
    strength = score >= 5 ? 'strong' : 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, score)
  };
}

/**
 * Generates a secure password suggestion
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()';
  
  const allChars = uppercase + lowercase + numbers + specialChars;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Checks if password has been breached (placeholder for API integration)
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // In production, integrate with HaveIBeenPwned API or similar service
  // For now, just check against our common passwords list
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

/**
 * Password strength meter component data
 */
export function getPasswordStrengthMeter(validation: PasswordValidationResult) {
  const colors = {
    weak: '#ef4444',
    medium: '#f59e0b',
    strong: '#10b981'
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
}
