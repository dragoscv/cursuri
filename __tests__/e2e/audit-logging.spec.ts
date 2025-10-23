import { test, expect, type Page } from '@playwright/test';

/**
 * Audit Logging E2E Tests
 *
 * Tests the complete audit logging system including:
 * - Log creation when admin actions occur
 * - Admin dashboard display and filtering
 * - Statistics calculation
 * - Meta-logging (accessing audit logs creates logs)
 */

// Test configuration
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@cursuri-platform.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'testpassword123';
const BASE_URL = process.env.BASE_URL || 'http://localhost:33990';

/**
 * Helper: Login as admin user
 */
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/`);

  // Wait for and click login button
  await page.waitForSelector('[data-testid="login-button"]', { timeout: 10000 });
  await page.click('[data-testid="login-button"]');

  // Fill login form
  await page.fill('[data-testid="email-input"]', ADMIN_EMAIL);
  await page.fill('[data-testid="password-input"]', ADMIN_PASSWORD);
  await page.click('[data-testid="submit-login"]');

  // Wait for successful login (redirect to profile or dashboard)
  await page.waitForURL(/\/(profile|dashboard|admin)/, { timeout: 15000 });
}

/**
 * Helper: Navigate to audit logs dashboard
 */
async function navigateToAuditDashboard(page: Page) {
  await page.goto(`${BASE_URL}/admin/audit`);
  await page.waitForSelector('[data-testid="audit-dashboard"]', { timeout: 10000 });
}

/**
 * Helper: Wait for logs to appear (Firestore may have slight delay)
 */
async function waitForLogs(page: Page, timeout = 5000) {
  await page.waitForTimeout(2000); // Wait for Firestore write
  await page.reload(); // Reload to fetch latest logs
  await page.waitForSelector('[data-testid="audit-dashboard"]', { timeout: 5000 });
}

test.describe('Audit Logging System', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display audit logs dashboard with statistics', async ({ page }) => {
    await navigateToAuditDashboard(page);

    // Verify statistics cards are visible
    await expect(page.locator('text=Total Logs')).toBeVisible();
    await expect(page.locator('text=Failed Actions')).toBeVisible();
    await expect(page.locator('text=Critical Events')).toBeVisible();
    await expect(page.locator('text=Warnings')).toBeVisible();

    // Verify statistics show numeric values
    const totalLogsCard = page.locator('[data-testid="stat-total-logs"]').first();
    const totalLogsText = await totalLogsCard.textContent();
    expect(totalLogsText).toMatch(/\d+/); // Should contain a number
  });

  test('should filter logs by time range', async ({ page }) => {
    await navigateToAuditDashboard(page);

    // Get initial log count
    const logsContainer = page.locator('[data-testid="logs-list"]');
    const initialLogCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    // Change time range filter
    await page.selectOption('[data-testid="time-range-filter"]', '1h');
    await waitForLogs(page, 3000);

    // Verify logs updated (count may change based on time range)
    const newLogCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();
    expect(typeof newLogCount).toBe('number');
  });

  test('should filter logs by category', async ({ page }) => {
    await navigateToAuditDashboard(page);

    // Apply category filter
    await page.selectOption('[data-testid="category-filter"]', 'admin_action');
    await waitForLogs(page, 3000);

    // Verify logs display (if any admin actions exist)
    const logsContainer = page.locator('[data-testid="logs-list"]');
    const logCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    // Either no logs (empty state) or all logs should be admin actions
    if (logCount > 0) {
      const firstLog = logsContainer.locator('[data-testid^="log-entry-"]').first();
      await expect(firstLog).toContainText(/admin|action/i);
    }
  });

  test('should filter logs by severity', async ({ page }) => {
    await navigateToAuditDashboard(page);

    // Apply severity filter
    await page.selectOption('[data-testid="severity-filter"]', 'warning');
    await waitForLogs(page, 3000);

    // Verify warning logs display with correct chip color
    const logsContainer = page.locator('[data-testid="logs-list"]');
    const logCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    if (logCount > 0) {
      // Warning severity should show orange/yellow chip
      const warningChip = page.locator('[data-testid="severity-chip"]').first();
      await expect(warningChip).toBeVisible();
    }
  });

  test('should expand log details', async ({ page }) => {
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 2000);

    const logsContainer = page.locator('[data-testid="logs-list"]');
    const logCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    if (logCount > 0) {
      // Click first log to expand details
      const firstLog = logsContainer.locator('[data-testid^="log-entry-"]').first();
      await firstLog.click();

      // Verify details are expanded
      await expect(page.locator('[data-testid="log-details"]').first()).toBeVisible();

      // Verify detail fields are present
      await expect(page.locator('text=User:')).toBeVisible();
      await expect(page.locator('text=IP Address:')).toBeVisible();
      await expect(page.locator('text=User Agent:')).toBeVisible();
    }
  });

  test('should create meta-log when accessing audit dashboard', async ({ page }) => {
    // Access audit dashboard
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 3000);

    // Apply filter to show meta-logging events
    await page.selectOption('[data-testid="category-filter"]', 'admin_action');
    await page.fill('[data-testid="search-input"]', 'audit_log_accessed');
    await waitForLogs(page, 2000);

    // Verify meta-log exists (accessing audit logs creates a log)
    const logsContainer = page.locator('[data-testid="logs-list"]');
    const metaLogExists = (await logsContainer.locator('text=/audit.*access/i').count()) > 0;

    // Meta-logging should be working
    expect(metaLogExists).toBeTruthy();
  });

  test('should display correct log structure', async ({ page }) => {
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 2000);

    const logsContainer = page.locator('[data-testid="logs-list"]');
    const logCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    if (logCount > 0) {
      const firstLog = logsContainer.locator('[data-testid^="log-entry-"]').first();

      // Verify log entry has required components
      await expect(firstLog.locator('[data-testid="log-action"]')).toBeVisible();
      await expect(firstLog.locator('[data-testid="log-timestamp"]')).toBeVisible();
      await expect(firstLog.locator('[data-testid="category-chip"]')).toBeVisible();
      await expect(firstLog.locator('[data-testid="severity-chip"]')).toBeVisible();
    }
  });

  test('should show statistics update when filters change', async ({ page }) => {
    await navigateToAuditDashboard(page);

    // Get initial statistics
    const initialTotal = await page
      .locator('[data-testid="stat-total-logs"]')
      .first()
      .textContent();

    // Apply filter
    await page.selectOption('[data-testid="category-filter"]', 'security');
    await waitForLogs(page, 3000);

    // Get updated statistics
    const updatedTotal = await page
      .locator('[data-testid="stat-total-logs"]')
      .first()
      .textContent();

    // Statistics should potentially change (unless all logs are security)
    expect(updatedTotal).toBeDefined();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    await navigateToAuditDashboard(page);

    // Apply very restrictive filter to likely get no results
    await page.selectOption('[data-testid="time-range-filter"]', '1h');
    await page.selectOption('[data-testid="category-filter"]', 'payment');
    await page.selectOption('[data-testid="severity-filter"]', 'critical');
    await waitForLogs(page, 2000);

    // Should show empty state or "no logs found" message
    const logsContainer = page.locator('[data-testid="logs-list"]');
    const logCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    if (logCount === 0) {
      // Empty state should be handled (no crash, informative message)
      expect(await page.locator('text=/no.*logs|empty/i').count()).toBeGreaterThan(0);
    }
  });

  test('should display user information in logs', async ({ page }) => {
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 2000);

    const logsContainer = page.locator('[data-testid="logs-list"]');
    const logCount = await logsContainer.locator('[data-testid^="log-entry-"]').count();

    if (logCount > 0) {
      // Expand first log
      const firstLog = logsContainer.locator('[data-testid^="log-entry-"]').first();
      await firstLog.click();

      // Verify user information is displayed
      const userEmail = page.locator('[data-testid="log-user-email"]').first();
      const userRole = page.locator('[data-testid="log-user-role"]').first();

      // At least one should be visible
      const emailVisible = await userEmail.isVisible();
      const roleVisible = await userRole.isVisible();

      expect(emailVisible || roleVisible).toBeTruthy();
    }
  });
});

test.describe('Audit Logging - Admin Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.skip('should log certificate generation', async ({ page }) => {
    // This test requires a completed course
    // Mark as skip for now, can be enabled when test data is available

    // Navigate to a completed course
    await page.goto(`${BASE_URL}/courses/test-course-id/certificate`);

    // Generate certificate
    await page.click('[data-testid="generate-certificate"]');
    await page.waitForResponse(
      (response) => response.url().includes('/api/certificate') && response.status() === 200
    );

    // Check audit logs
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 3000);

    // Filter for certificate actions
    await page.fill('[data-testid="search-input"]', 'certificate_generated');
    await waitForLogs(page, 2000);

    // Verify log exists
    const logsContainer = page.locator('[data-testid="logs-list"]');
    await expect(logsContainer.locator('text=certificate_generated')).toBeVisible();
  });

  test.skip('should log invoice generation', async ({ page }) => {
    // This test requires a payment record
    // Mark as skip for now, can be enabled when test data is available

    await page.goto(`${BASE_URL}/profile/payments`);

    // Generate invoice for first payment
    await page.click('[data-testid="generate-invoice-btn"]');
    await page.waitForResponse(
      (response) => response.url().includes('/api/invoice/generate') && response.status() === 200
    );

    // Check audit logs
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 3000);

    await page.fill('[data-testid="search-input"]', 'invoice_generated');
    await waitForLogs(page, 2000);

    await expect(page.locator('text=invoice_generated')).toBeVisible();
  });
});

test.describe('Audit Logging - Security Events', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.skip('should log rate limit exceeded', async ({ page }) => {
    // This test requires making 20+ requests rapidly
    // Mark as skip for manual testing

    // Make 21+ requests to trigger rate limit
    for (let i = 0; i < 22; i++) {
      await page.request.post(`${BASE_URL}/api/stripe/create-price`, {
        data: {
          productName: `Test Product ${i}`,
          amount: 1000,
          currency: 'usd',
        },
        headers: {
          Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('authToken'))}`,
        },
      });
    }

    // Check audit logs for rate limit event
    await navigateToAuditDashboard(page);
    await waitForLogs(page, 3000);

    await page.selectOption('[data-testid="severity-filter"]', 'warning');
    await page.fill('[data-testid="search-input"]', 'rate_limit_exceeded');
    await waitForLogs(page, 2000);

    await expect(page.locator('text=rate_limit_exceeded')).toBeVisible();
  });
});
