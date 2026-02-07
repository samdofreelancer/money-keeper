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

    // Assert - verify page heading is visible
    await expect(accountPage.getPageHeading()).toBeVisible();
  });

  test('should display account table', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();

    // Assert - verify table is visible
    await expect(accountPage.getAccountTable()).toBeVisible();
  });

  test('should display create account button', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();

    // Assert - verify button is visible
    await expect(accountPage.getCreateAccountButton()).toBeVisible();
  });
});
