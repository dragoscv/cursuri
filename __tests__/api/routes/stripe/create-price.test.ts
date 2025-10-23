/**
 * Stripe Create Price API Route Tests
 *
 * Tests the /api/stripe/create-price endpoint with REAL:
 * - Firebase authentication and authorization
 * - Stripe test mode API
 * - Rate limiting
 * - Input validation
 *
 * Cleanup: All test prices and products are deleted after tests
 *
 * NOTE: This test requires the dev server to be running on http://localhost:3000
 * Start the server with: npm run dev
 */

import {
  generateTestUserToken,
  generateTestAdminToken,
  cleanupTestUsers,
} from '../../helpers/testAuthSimple';
import Stripe from 'stripe';

// Initialize Stripe with test API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Track created Stripe resources for cleanup
const createdPriceIds: string[] = [];
const createdProductIds: string[] = [];

const API_BASE_URL = 'http://localhost:33990';

/**
 * Helper to make authenticated API request
 */
async function makeRequest(
  endpoint: string,
  method: string,
  token?: string,
  body?: any
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('/api/stripe/create-price API Route', () => {
  // Cleanup after all tests
  afterAll(async () => {
    // Delete test prices
    await Promise.all(
      createdPriceIds.map(async (priceId) => {
        try {
          await stripe.prices.update(priceId, { active: false });
        } catch (error) {
          console.error(`Failed to deactivate price ${priceId}:`, error);
        }
      })
    );

    // Delete test products
    await Promise.all(
      createdProductIds.map(async (productId) => {
        try {
          await stripe.products.update(productId, { active: false });
        } catch (error) {
          console.error(`Failed to deactivate product ${productId}:`, error);
        }
      })
    );

    // Clean up test Firebase users
    await cleanupTestUsers();
  });

  describe('Authentication & Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', undefined, {
        productName: 'Test Product',
        amount: 1000,
        currency: 'USD',
      });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const { token } = await generateTestUserToken(); // Regular user

      const response = await makeRequest('/api/stripe/create-price', 'POST', token, {
        productName: 'Test Product',
        amount: 1000,
        currency: 'USD',
      });

      expect(response.status).toBe(403);
    });

    it('should allow admin users to create prices', async () => {
      const { token } = await generateTestAdminToken();

      const response = await makeRequest('/api/stripe/create-price', 'POST', token, {
        productName: `Test Product ${Date.now()}`,
        productDescription: 'Test description',
        amount: 2500,
        currency: 'USD',
        metadata: { test: 'true' },
      });

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.productId).toBeTruthy();
      expect(body.priceId).toBeTruthy();
      expect(body.amount).toBe(2500);
      expect(body.currency).toBe('usd');

      // Track for cleanup
      createdPriceIds.push(body.priceId);
      createdProductIds.push(body.productId);
    });
  });

  describe('Input Validation', () => {
    let adminToken: string;

    beforeAll(async () => {
      const result = await generateTestAdminToken();
      adminToken = result.token;
    });

    it('should reject missing productName', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        amount: 1000,
        currency: 'USD',
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Missing required fields');
    });

    it('should reject missing amount', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: 'Test Product',
        currency: 'USD',
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Missing required fields');
    });

    it('should reject missing currency', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: 'Test Product',
        amount: 1000,
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Missing required fields');
    });

    it('should reject negative amounts', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: 'Test Product',
        amount: -100,
        currency: 'USD',
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Amount must be a positive number');
    });

    it('should reject zero amounts', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: 'Test Product',
        amount: 0,
        currency: 'USD',
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Amount must be a positive number');
    });

    it('should reject non-numeric amounts', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: 'Test Product',
        amount: 'invalid',
        currency: 'USD',
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Amount must be a positive number');
    });
  });

  describe('Stripe Integration', () => {
    let adminToken: string;

    beforeAll(async () => {
      const result = await generateTestAdminToken();
      adminToken = result.token;
    });

    it('should create a new product and price', async () => {
      const uniqueProductName = `Test Course ${Date.now()}`;

      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: uniqueProductName,
        productDescription: 'A test course for API testing',
        amount: 4999,
        currency: 'USD',
        metadata: { courseId: 'test-123', test: 'true' },
      });

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.productName).toBe(uniqueProductName);
      expect(body.amount).toBe(4999);
      expect(body.currency).toBe('usd');

      // Verify in Stripe
      const price = await stripe.prices.retrieve(body.priceId);
      expect(price.unit_amount).toBe(4999);
      expect(price.currency).toBe('usd');
      expect(price.metadata?.test).toBe('true');

      // Track for cleanup
      createdPriceIds.push(body.priceId);
      createdProductIds.push(body.productId);
    });

    it('should reuse existing product with same name', async () => {
      const sharedProductName = `Shared Product ${Date.now()}`;

      // First request - creates product
      const response1 = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: sharedProductName,
        amount: 1000,
        currency: 'USD',
      });

      const body1 = await response1.json();

      // Second request - should reuse product
      const response2 = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: sharedProductName,
        amount: 2000,
        currency: 'USD',
      });

      const body2 = await response2.json();

      // Should reuse same product
      expect(body2.productId).toBe(body1.productId);
      // But create different price
      expect(body2.priceId).not.toBe(body1.priceId);

      // Track for cleanup
      createdPriceIds.push(body1.priceId, body2.priceId);
      createdProductIds.push(body1.productId); // Only one product
    });

    it('should handle different currencies correctly', async () => {
      const { token } = await generateTestAdminToken();

      // Test RON currency
      const responseRON = await makeRequest('/api/stripe/create-price', 'POST', token, {
        productName: `RON Test ${Date.now()}`,
        amount: 10000,
        currency: 'RON',
      });

      const bodyRON = await responseRON.json();
      expect(bodyRON.currency).toBe('ron');

      // Track for cleanup
      createdPriceIds.push(bodyRON.priceId);
      createdProductIds.push(bodyRON.productId);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits (20 requests per minute)', async () => {
      const { token } = await generateTestAdminToken();

      let rateLimitHit = false;
      const maxAttempts = 25; // More than rate limit

      for (let i = 0; i < maxAttempts; i++) {
        const response = await makeRequest('/api/stripe/create-price', 'POST', token, {
          productName: `Rate Limit Test ${Date.now()}-${i}`,
          amount: 1000,
          currency: 'USD',
        });

        if (response.status === 429) {
          rateLimitHit = true;
          const body = await response.json();
          expect(body.error).toContain('Rate limit exceeded');
          break;
        }

        // Track successful creations for cleanup
        if (response.ok) {
          const body = await response.json();
          createdPriceIds.push(body.priceId);
          createdProductIds.push(body.productId);
        }
      }

      expect(rateLimitHit).toBe(true);
    }, 30000); // Increase timeout for rate limit test
  });

  describe('Metadata Handling', () => {
    let adminToken: string;

    beforeAll(async () => {
      const result = await generateTestAdminToken();
      adminToken = result.token;
    });

    it('should include custom metadata in price', async () => {
      const response = await makeRequest('/api/stripe/create-price', 'POST', adminToken, {
        productName: `Metadata Test ${Date.now()}`,
        amount: 3000,
        currency: 'USD',
        metadata: {
          courseId: 'course-123',
          category: 'programming',
          difficulty: 'advanced',
        },
      });

      const body = await response.json();

      // Verify metadata in Stripe
      const price = await stripe.prices.retrieve(body.priceId);
      expect(price.metadata?.courseId).toBe('course-123');
      expect(price.metadata?.category).toBe('programming');
      expect(price.metadata?.difficulty).toBe('advanced');
      expect(price.metadata?.app).toBe('cursuri');

      // Track for cleanup
      createdPriceIds.push(body.priceId);
      createdProductIds.push(body.productId);
    });
  });
});
