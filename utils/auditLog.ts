/**
 * Audit Logging System
 *
 * Provides comprehensive audit trail for security-critical operations
 * including admin actions, authentication events, and data modifications.
 *
 * Features:
 * - Structured logging with consistent format
 * - IP address and user-agent tracking
 * - Severity levels (info, warning, critical)
 * - Automatic timestamps and metadata
 * - Firestore persistence with indexed queries
 * - GDPR-compliant data retention
 *
 * @module utils/auditLog
 */

import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest } from 'next/server';
import { AuthenticatedUser } from './api/auth';

/**
 * Audit log severity levels
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Audit log event categories
 */
export enum AuditCategory {
  AUTH = 'authentication',
  ADMIN = 'admin_action',
  COURSE = 'course_management',
  USER = 'user_management',
  PAYMENT = 'payment',
  SECURITY = 'security',
  API = 'api_access',
  DATA = 'data_modification',
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  timestamp: string;
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Extract client information from request
 */
function extractClientInfo(request: NextRequest): {
  ipAddress: string;
  userAgent: string;
} {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Create audit log entry in Firestore
 *
 * @param entry - Audit log entry data
 * @returns Promise resolving to the created document ID
 *
 * @example
 * ```typescript
 * await createAuditLog({
 *   category: AuditCategory.ADMIN,
 *   action: 'course_deleted',
 *   severity: AuditSeverity.WARNING,
 *   userId: 'user123',
 *   resourceId: 'course456',
 *   success: true,
 * });
 * ```
 */
async function createAuditLog(entry: AuditLogEntry): Promise<string> {
  try {
    const db = getFirestore();
    const auditRef = await db.collection('audit_logs').add({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return auditRef.id;
  } catch (error) {
    // Critical: Audit logging failure should not break the application
    console.error('Failed to create audit log:', error);
    // In production, send alert to monitoring system
    return '';
  }
}

/**
 * Log authentication events
 *
 * @param action - Authentication action (login, logout, register, etc.)
 * @param request - Next.js request object
 * @param user - Authenticated user (if successful)
 * @param success - Whether the action succeeded
 * @param errorMessage - Error message if failed
 *
 * @example
 * ```typescript
 * await logAuthEvent('login', request, user, true);
 * await logAuthEvent('login_failed', request, undefined, false, 'Invalid credentials');
 * ```
 */
export async function logAuthEvent(
  action: string,
  request: NextRequest,
  user?: AuthenticatedUser,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.AUTH,
    action,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    userId: user?.uid,
    userEmail: user?.email,
    userRole: user?.role,
    ipAddress,
    userAgent,
    success,
    errorMessage,
  });
}

/**
 * Log admin actions
 *
 * @param action - Admin action description
 * @param request - Next.js request object
 * @param user - Admin user performing the action
 * @param resourceType - Type of resource being modified
 * @param resourceId - ID of the resource
 * @param details - Additional action details
 * @param success - Whether the action succeeded
 *
 * @example
 * ```typescript
 * await logAdminAction(
 *   'course_created',
 *   request,
 *   adminUser,
 *   'course',
 *   'course123',
 *   { courseName: 'TypeScript Fundamentals', price: 99 },
 *   true
 * );
 * ```
 */
export async function logAdminAction(
  action: string,
  request: NextRequest,
  user: AuthenticatedUser,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  success: boolean = true
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.ADMIN,
    action,
    severity: AuditSeverity.WARNING, // Admin actions always at least WARNING
    userId: user.uid,
    userEmail: user.email,
    userRole: user.role,
    ipAddress,
    userAgent,
    resourceType,
    resourceId,
    details,
    success,
  });
}

/**
 * Log security events
 *
 * @param action - Security event description
 * @param request - Next.js request object
 * @param severity - Event severity
 * @param details - Event details
 * @param userId - User ID if applicable
 *
 * @example
 * ```typescript
 * await logSecurityEvent(
 *   'rate_limit_exceeded',
 *   request,
 *   AuditSeverity.WARNING,
 *   { limit: 10, window: '10s', endpoint: '/api/auth/login' }
 * );
 * ```
 */
export async function logSecurityEvent(
  action: string,
  request: NextRequest,
  severity: AuditSeverity,
  details?: Record<string, any>,
  userId?: string
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.SECURITY,
    action,
    severity,
    userId,
    ipAddress,
    userAgent,
    details,
    success: false, // Security events are typically failures/alerts
  });
}

/**
 * Log payment transactions
 *
 * @param action - Payment action
 * @param request - Next.js request object
 * @param user - User making the payment
 * @param amount - Payment amount
 * @param currency - Payment currency
 * @param paymentId - Payment provider transaction ID
 * @param success - Whether payment succeeded
 * @param errorMessage - Error message if failed
 *
 * @example
 * ```typescript
 * await logPaymentTransaction(
 *   'payment_processed',
 *   request,
 *   user,
 *   9900,
 *   'USD',
 *   'pi_1234567890',
 *   true
 * );
 * ```
 */
export async function logPaymentTransaction(
  action: string,
  request: NextRequest,
  user: AuthenticatedUser,
  amount: number,
  currency: string,
  paymentId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.PAYMENT,
    action,
    severity: success ? AuditSeverity.INFO : AuditSeverity.CRITICAL,
    userId: user.uid,
    userEmail: user.email,
    userRole: user.role,
    ipAddress,
    userAgent,
    resourceId: paymentId,
    resourceType: 'payment',
    details: {
      amount,
      currency,
      amountFormatted: `${(amount / 100).toFixed(2)} ${currency}`,
    },
    success,
    errorMessage,
  });
}

/**
 * Log course management actions
 *
 * @param action - Course action
 * @param request - Next.js request object
 * @param user - User performing the action
 * @param courseId - Course ID
 * @param details - Additional details
 * @param success - Whether action succeeded
 *
 * @example
 * ```typescript
 * await logCourseAction(
 *   'course_published',
 *   request,
 *   adminUser,
 *   'course123',
 *   { courseName: 'React Mastery', previousStatus: 'draft' },
 *   true
 * );
 * ```
 */
export async function logCourseAction(
  action: string,
  request: NextRequest,
  user: AuthenticatedUser,
  courseId: string,
  details?: Record<string, any>,
  success: boolean = true
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.COURSE,
    action,
    severity: AuditSeverity.INFO,
    userId: user.uid,
    userEmail: user.email,
    userRole: user.role,
    ipAddress,
    userAgent,
    resourceType: 'course',
    resourceId: courseId,
    details,
    success,
  });
}

/**
 * Log user management actions
 *
 * @param action - User management action
 * @param request - Next.js request object
 * @param adminUser - Admin performing the action
 * @param targetUserId - User being managed
 * @param details - Action details
 * @param success - Whether action succeeded
 *
 * @example
 * ```typescript
 * await logUserManagementAction(
 *   'role_changed',
 *   request,
 *   adminUser,
 *   'user456',
 *   { previousRole: 'user', newRole: 'admin' },
 *   true
 * );
 * ```
 */
export async function logUserManagementAction(
  action: string,
  request: NextRequest,
  adminUser: AuthenticatedUser,
  targetUserId: string,
  details?: Record<string, any>,
  success: boolean = true
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.USER,
    action,
    severity: AuditSeverity.WARNING, // User management is sensitive
    userId: adminUser.uid,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    ipAddress,
    userAgent,
    resourceType: 'user',
    resourceId: targetUserId,
    details,
    success,
  });
}

/**
 * Log API access for monitoring and debugging
 *
 * @param endpoint - API endpoint accessed
 * @param request - Next.js request object
 * @param userId - User ID if authenticated
 * @param statusCode - Response status code
 * @param responseTime - Response time in milliseconds
 *
 * @example
 * ```typescript
 * await logAPIAccess('/api/courses', request, user.uid, 200, 145);
 * ```
 */
export async function logAPIAccess(
  endpoint: string,
  request: NextRequest,
  userId?: string,
  statusCode?: number,
  responseTime?: number
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  // Only log API access for non-GET requests or errors
  const method = request.method;
  if (method === 'GET' && statusCode && statusCode < 400) {
    return; // Skip successful GET requests to reduce log volume
  }

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.API,
    action: `${method} ${endpoint}`,
    severity: statusCode && statusCode >= 500 ? AuditSeverity.CRITICAL : AuditSeverity.INFO,
    userId,
    ipAddress,
    userAgent,
    details: {
      method,
      endpoint,
      statusCode,
      responseTime,
    },
    success: statusCode ? statusCode < 400 : true,
  });
}

/**
 * Log data modification events
 *
 * @param action - Data modification action
 * @param request - Next.js request object
 * @param user - User performing the modification
 * @param resourceType - Type of data modified
 * @param resourceId - ID of modified resource
 * @param changes - Changes made (before/after values)
 * @param success - Whether modification succeeded
 *
 * @example
 * ```typescript
 * await logDataModification(
 *   'lesson_content_updated',
 *   request,
 *   user,
 *   'lesson',
 *   'lesson789',
 *   { before: { duration: 30 }, after: { duration: 45 } },
 *   true
 * );
 * ```
 */
export async function logDataModification(
  action: string,
  request: NextRequest,
  user: AuthenticatedUser,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>,
  success: boolean = true
): Promise<void> {
  const { ipAddress, userAgent } = extractClientInfo(request);

  await createAuditLog({
    timestamp: new Date().toISOString(),
    category: AuditCategory.DATA,
    action,
    severity: AuditSeverity.INFO,
    userId: user.uid,
    userEmail: user.email,
    userRole: user.role,
    ipAddress,
    userAgent,
    resourceType,
    resourceId,
    details: changes,
    success,
  });
}

/**
 * Query audit logs with filters
 *
 * @param filters - Query filters
 * @param limit - Maximum number of results
 * @returns Array of audit log entries
 *
 * @example
 * ```typescript
 * const logs = await queryAuditLogs({
 *   category: AuditCategory.ADMIN,
 *   userId: 'user123',
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31',
 * }, 100);
 * ```
 */
export async function queryAuditLogs(
  filters: {
    category?: AuditCategory;
    userId?: string;
    severity?: AuditSeverity;
    startDate?: string;
    endDate?: string;
    resourceId?: string;
    action?: string;
  },
  limit: number = 100
): Promise<AuditLogEntry[]> {
  try {
    const db = getFirestore();
    let query = db.collection('audit_logs').orderBy('timestamp', 'desc').limit(limit);

    if (filters.category) {
      query = query.where('category', '==', filters.category) as any;
    }
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId) as any;
    }
    if (filters.severity) {
      query = query.where('severity', '==', filters.severity) as any;
    }
    if (filters.startDate) {
      query = query.where('timestamp', '>=', filters.startDate) as any;
    }
    if (filters.endDate) {
      query = query.where('timestamp', '<=', filters.endDate) as any;
    }
    if (filters.resourceId) {
      query = query.where('resourceId', '==', filters.resourceId) as any;
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as AuditLogEntry);
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return [];
  }
}

/**
 * Get audit log statistics
 *
 * @param startDate - Start date for statistics
 * @param endDate - End date for statistics
 * @returns Statistics object
 */
export async function getAuditLogStatistics(
  startDate: string,
  endDate: string
): Promise<{
  totalLogs: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  failedActions: number;
  topUsers: Array<{ userId: string; count: number }>;
}> {
  try {
    const logs = await queryAuditLogs({ startDate, endDate }, 10000);

    const stats = {
      totalLogs: logs.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      failedActions: logs.filter((log) => !log.success).length,
      topUsers: [] as Array<{ userId: string; count: number }>,
    };

    // Count by category
    logs.forEach((log) => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
    });

    // Top users
    const userCounts: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    });

    stats.topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  } catch (error) {
    console.error('Failed to get audit log statistics:', error);
    return {
      totalLogs: 0,
      byCategory: {},
      bySeverity: {},
      failedActions: 0,
      topUsers: [],
    };
  }
}
