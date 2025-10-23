/**
 * HTTP Request Test Helpers
 *
 * Utilities for creating authenticated API requests and validating responses
 * in Next.js API route tests with REAL Firebase authentication.
 *
 * Usage:
 * ```typescript
 * const { token } = await generateTestAdminToken();
 * const request = createAuthenticatedRequest('/api/admin/users', 'GET', token);
 * const response = await GET(request);
 *
 * expectSuccess(response);
 * expectUnauthorized(response);
 * ```
 */

import { NextRequest } from 'next/server';

/**
 * Create an authenticated NextRequest for API route testing
 *
 * @param url - API route URL (e.g., '/api/admin/users')
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param token - Firebase custom token or ID token
 * @param body - Request body (for POST, PUT, PATCH)
 * @param headers - Additional headers
 * @returns NextRequest object ready for API route handler
 */
export function createAuthenticatedRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  token?: string,
  body?: any,
  headers: Record<string, string> = {}
): NextRequest {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestInit: any = {
    method,
    headers: requestHeaders,
  };

  // Add body for POST, PUT, PATCH requests
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(fullUrl, requestInit) as NextRequest;
}

/**
 * Create an unauthenticated request (no token)
 */
export function createUnauthenticatedRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): NextRequest {
  return createAuthenticatedRequest(url, method, undefined, body, headers);
}

/**
 * Assert that response is successful (200-299 status)
 */
export function expectSuccess(response: Response): void {
  expect(response.ok).toBe(true);
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
}

/**
 * Assert that response is 401 Unauthorized
 */
export function expectUnauthorized(response: Response): void {
  expect(response.status).toBe(401);
}

/**
 * Assert that response is 403 Forbidden
 */
export function expectForbidden(response: Response): void {
  expect(response.status).toBe(403);
}

/**
 * Assert that response is 400 Bad Request
 */
export function expectBadRequest(response: Response): void {
  expect(response.status).toBe(400);
}

/**
 * Assert that response is 404 Not Found
 */
export function expectNotFound(response: Response): void {
  expect(response.status).toBe(404);
}

/**
 * Assert that response is 429 Too Many Requests (rate limited)
 */
export function expectRateLimited(response: Response): void {
  expect(response.status).toBe(429);
}

/**
 * Assert that response is 500 Internal Server Error
 */
export function expectServerError(response: Response): void {
  expect(response.status).toBe(500);
}

/**
 * Parse JSON response body
 */
export async function getResponseBody<T = any>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Failed to parse response body as JSON: ${text}`);
  }
}

/**
 * Assert response has specific JSON body structure
 */
export async function expectResponseBody<T = any>(
  response: Response,
  expectedBody: Partial<T>
): Promise<void> {
  const body = await getResponseBody<T>(response);

  Object.keys(expectedBody).forEach((key) => {
    expect(body).toHaveProperty(key);
    expect(body[key as keyof T]).toEqual(expectedBody[key as keyof T]);
  });
}

/**
 * Assert response contains error message
 */
export async function expectErrorMessage(
  response: Response,
  expectedMessage: string | RegExp
): Promise<void> {
  const body = await getResponseBody<{ error?: string; message?: string }>(response);

  const errorMessage = body.error || body.message || '';

  if (typeof expectedMessage === 'string') {
    expect(errorMessage).toContain(expectedMessage);
  } else {
    expect(errorMessage).toMatch(expectedMessage);
  }
}

/**
 * Assert response has specific status and error message
 */
export async function expectError(
  response: Response,
  status: number,
  message?: string | RegExp
): Promise<void> {
  expect(response.status).toBe(status);

  if (message) {
    await expectErrorMessage(response, message);
  }
}

/**
 * Create a multipart/form-data request (for file uploads)
 */
export function createMultipartRequest(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
  token?: string,
  formData?: FormData,
  headers: Record<string, string> = {}
): NextRequest {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const requestHeaders: Record<string, string> = {
    ...headers,
    // Don't set Content-Type for FormData - browser will set it with boundary
  };

  // Add authorization header if token provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestInit: any = {
    method,
    headers: requestHeaders,
    body: formData,
  };

  return new NextRequest(fullUrl, requestInit) as NextRequest;
}

/**
 * Wait for async operation with timeout
 * Useful for testing background jobs
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Simulate rate limiting by making multiple requests
 */
export async function simulateRateLimit(
  requestFn: () => Promise<Response>,
  count: number = 10
): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let i = 0; i < count; i++) {
    lastResponse = await requestFn();

    // Stop if rate limited
    if (lastResponse.status === 429) {
      return lastResponse;
    }
  }

  return lastResponse!;
}
