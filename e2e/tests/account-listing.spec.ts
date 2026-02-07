import { test, expect } from '@/fixtures/test-fixture';

/**
 * Account Listing Page Tests
 * 
 * Tests for the account list view:
 * - Page navigation
 * - Table display
 * - Button visibility
 * - List functionality
 */

test.describe('Account Listing Page', () => {
  test('should navigate to accounts page', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();

    // Assert - verify page title or heading exists
    const heading = await accountPage.getPage().locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display account table', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();

    // Assert - verify table exists
    const table = accountPage.getPage().locator('[data-testid="account-table"]');
    await expect(table).toBeVisible();
  });

  test('should display create account button', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();

    // Assert - verify button exists
    const createButton = accountPage.getPage().locator('[data-testid="add-account-button"]');
    await expect(createButton).toBeVisible();
  });
});
