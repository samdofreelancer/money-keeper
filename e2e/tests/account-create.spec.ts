import { test, expect } from '@/fixtures/test-fixture';

/**
 * Account Creation Tests
 * 
 * Tests for the create account dialog:
 * - Dialog opening/closing
 * - Form field filling
 * - Form submission
 * - Error handling
 * - Validation
 */

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
