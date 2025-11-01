/**
 * Input Validation Utilities
 *
 * Provides comprehensive input validation using Zod schemas to prevent
 * injection attacks, invalid data types, and malicious payloads.
 *
 * @module utils/security/inputValidation
 */

import { z, ZodError, ZodSchema } from 'zod';
import { NextRequest } from 'next/server';

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Array<{ field: string; message: string }>;
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
    /**
     * Firebase document ID (alphanumeric, 20-28 chars)
     */
    firebaseId: z
        .string()
        .min(10, 'ID must be at least 10 characters')
        .max(50, 'ID must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'ID contains invalid characters'),

    /**
     * Email validation
     */
    email: z.string().email('Invalid email address').max(254, 'Email too long'),

    /**
     * URL validation
     */
    url: z.string().url('Invalid URL format').max(2048, 'URL too long'),

    /**
     * Positive integer
     */
    positiveInt: z.number().int('Must be an integer').positive('Must be positive'),

    /**
     * Pagination limit (1-100)
     */
    paginationLimit: z.number().int().min(1).max(100).default(10),

    /**
     * ISO date string
     */
    isoDate: z.string().datetime('Invalid date format'),

    /**
     * Safe text (prevents script injection)
     */
    safeText: z
        .string()
        .max(10000, 'Text too long')
        .refine(
            (val) => !/<script|javascript:|on\w+=/i.test(val),
            'Text contains potentially dangerous content'
        ),

    /**
     * File upload validation
     */
    fileUpload: z.object({
        name: z.string().max(255),
        size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
        type: z.string().regex(/^[\w-]+\/[\w-]+$/, 'Invalid MIME type'),
    }),
};

/**
 * API-specific validation schemas
 */
export const APISchemas = {
    /**
     * Certificate generation request
     */
    certificateRequest: z.object({
        courseId: CommonSchemas.firebaseId,
    }),

    /**
     * Invoice generation request
     */
    invoiceRequest: z.object({
        paymentId: CommonSchemas.firebaseId,
        userId: CommonSchemas.firebaseId,
    }),

    /**
     * Stripe price creation (admin only)
     */
    stripePriceCreate: z.object({
        productName: z.string().min(1).max(200),
        productDescription: z.string().max(1000).optional(),
        amount: z.number().int().positive().max(99999999), // Max $999,999.99
        currency: z.string().length(3).toLowerCase(),
        metadata: z.record(z.string()).optional(),
    }),

    /**
     * Caption generation request
     */
    captionRequest: z.object({
        videoUrl: CommonSchemas.url,
        courseId: CommonSchemas.firebaseId,
        lessonId: CommonSchemas.firebaseId,
    }),

    /**
     * Lesson sync request
     */
    lessonSyncRequest: z.object({
        courseId: CommonSchemas.firebaseId,
        lessonId: CommonSchemas.firebaseId,
    }),

    /**
     * Contact message (public endpoint)
     */
    contactMessage: z.object({
        name: z.string().min(2).max(100),
        email: CommonSchemas.email,
        subject: z.string().min(5).max(200),
        message: z.string().min(10).max(5000),
        honeypot: z.string().max(0).optional(), // Should be empty for legitimate submissions
    }),

    /**
     * Audit log query
     */
    auditLogQuery: z.object({
        category: z.enum(['auth', 'admin', 'payment', 'security', 'api']).optional(),
        severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
        timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
        userId: CommonSchemas.firebaseId.optional(),
        resourceId: CommonSchemas.firebaseId.optional(),
    }),
};

/**
 * Validate request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return {
                success: false,
                error: `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
                errors,
            };
        }

        return {
            success: false,
            error: 'Validation error occurred',
        };
    }
}

/**
 * Validate request body from Next.js request
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result
 */
export async function validateRequestBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
    try {
        // Check content type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {
                success: false,
                error: 'Content-Type must be application/json',
            };
        }

        // Parse JSON body
        const body = await request.json();

        // Validate against schema
        return validateSchema(schema, body);
    } catch (error) {
        if (error instanceof SyntaxError) {
            return {
                success: false,
                error: 'Invalid JSON in request body',
            };
        }

        return {
            success: false,
            error: 'Failed to parse request body',
        };
    }
}

/**
 * Validate query parameters from URL
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result
 */
export function validateQueryParams<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): ValidationResult<T> {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string | string[]> = {};

    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
        if (params[key]) {
            // Handle multiple values for same key
            if (Array.isArray(params[key])) {
                (params[key] as string[]).push(value);
            } else {
                params[key] = [params[key] as string, value];
            }
        } else {
            params[key] = value;
        }
    });

    return validateSchema(schema, params);
}

/**
 * Sanitize string input to prevent injection attacks
 *
 * @param input - Raw string input
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Enforce max length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
}

/**
 * Validate file size and type
 *
 * @param file - File metadata
 * @param allowedTypes - Allowed MIME types
 * @param maxSize - Maximum file size in bytes
 * @returns Validation result
 */
export function validateFile(
    file: { name: string; size: number; type: string },
    allowedTypes: string[],
    maxSize: number = 10 * 1024 * 1024 // 10MB default
): ValidationResult {
    if (file.size > maxSize) {
        return {
            success: false,
            error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            success: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    // Check for double extensions (e.g., .jpg.exe)
    const fileName = file.name.toLowerCase();
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.asp', '.aspx', '.jsp'];

    if (suspiciousExtensions.some((ext) => fileName.includes(ext))) {
        return {
            success: false,
            error: 'File name contains suspicious extension',
        };
    }

    return {
        success: true,
    };
}

/**
 * Rate limit helper for request validation
 * Returns true if request should be blocked
 */
export function isRateLimited(
    identifier: string,
    limits: Map<string, { count: number; resetTime: number }>,
    maxRequests: number,
    windowMs: number
): boolean {
    const now = Date.now();
    const record = limits.get(identifier);

    if (!record || now > record.resetTime) {
        limits.set(identifier, { count: 1, resetTime: now + windowMs });
        return false;
    }

    if (record.count >= maxRequests) {
        return true;
    }

    record.count++;
    return false;
}

/**
 * Validate request size to prevent DOS attacks
 */
export function validateRequestSize(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
    const contentLength = request.headers.get('content-length');

    if (contentLength && parseInt(contentLength) > maxSize) {
        return false;
    }

    return true;
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
        /(union|join|where|having|order by|group by)/gi,
        /('|"|;|--|\*|\/\*|\*\/)/g,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for NoSQL injection patterns
 */
export function hasNoSQLInjection(input: string): boolean {
    const noSqlPatterns = [
        /\$where/gi,
        /\$ne/gi,
        /\$gt/gi,
        /\$lt/gi,
        /\$or/gi,
        /\$and/gi,
        /\$regex/gi,
    ];

    return noSqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Comprehensive input validation for API routes
 */
export function validateApiInput(input: string): ValidationResult {
    if (hasSQLInjection(input)) {
        return {
            success: false,
            error: 'Input contains potential SQL injection patterns',
        };
    }

    if (hasNoSQLInjection(input)) {
        return {
            success: false,
            error: 'Input contains potential NoSQL injection patterns',
        };
    }

    return {
        success: true,
    };
}
