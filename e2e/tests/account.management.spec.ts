import { test, expect } from '@/fixtures/test-fixture';

/**
 * Account Management Test Suite
 * 
 * Organized by screen and feature:
 * 1. Account Listing Page
 * 2. Create Account Dialog
 * 3. Update Account (future)
 * 4. Delete Account (future)
 */

test.describe('Account Management', () => {
  // ========================================
  // 1. ACCOUNT LISTING PAGE TESTS
  // ========================================

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

  // ========================================
  // 2. CREATE ACCOUNT DIALOG TESTS
  // ========================================

  test.describe('Create Account Dialog', () => {
    test('should open dialog when create button is clicked', async ({ accountPage }) => {
      // Act
      await accountPage.navigateToAccounts();
      await accountPage.openCreateAccountDialog();

      // Assert - verify dialog is visible
      const dialog = accountPage.getPage().locator('[data-testid="account-dialog"]');
      await expect(dialog).toBeVisible();
    });

    test('should close dialog when cancel button is clicked', async ({ accountPage }) => {
      // Act
      await accountPage.navigateToAccounts();
      await accountPage.openCreateAccountDialog();
      await accountPage.closeDialog();

      // Assert - verify dialog is hidden
      const dialog = accountPage.getPage().locator('[data-testid="account-dialog"]');
      await expect(dialog).not.toBeVisible();
    });

    test('should fill account name field', async ({ accountPage }) => {
      // Act
      await accountPage.navigateToAccounts();
      await accountPage.openCreateAccountDialog();
      await accountPage.fillAccountName('Test Savings');

      // Assert - verify value was set
      const input = accountPage.getPage().locator('[data-testid="input-account-name"]');
      await expect(input).toHaveValue('Test Savings');
    });

    test('should fill initial balance field', async ({ accountPage }) => {
      // Act
      await accountPage.navigateToAccounts();
      await accountPage.openCreateAccountDialog();
      await accountPage.fillInitialBalance(1000000);

      // Assert - verify value was set
      const input = accountPage.getPage().locator('[data-testid="input-account-balance"] input');
      const value = await input.inputValue();
      expect(value).toBe('1000000');
    });
  });

  // ========================================
  // 3. UPDATE ACCOUNT TESTS (Future)
  // ========================================

  test.describe('Update Account', () => {
    test.skip('should edit account name', async ({ accountPage }) => {
      // TODO: Implement update tests
    });
  });

  // ========================================
  // 4. DELETE ACCOUNT TESTS (Future)
  // ========================================

  test.describe('Delete Account', () => {
    test.skip('should delete account with confirmation', async ({ accountPage }) => {
      // TODO: Implement delete tests
    });
  });
});
