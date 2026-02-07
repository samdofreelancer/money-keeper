import { test, expect } from '@/fixtures/test-fixture';
import { logger } from '@/utils/logger';
import { createAccountE2E } from './helpers/account.helper';

/**
 * Account Creation Tests
 * 
 * Tests for the create account dialog:
 * - Dialog opening/closing
 * - Form field filling
 * - Form submission
 * - Error handling
 * - Validation
 * 
 * ✅ Automatic cleanup: All test accounts (TEST_ prefix) deleted after each test
 * ✅ Uses helper functions to DRY up test code
 */

test.describe('Create Account Dialog', () => {
  test.beforeEach(async ({ accountPage }) => {
    await accountPage.navigateToAccounts();
  });

  test('should open dialog when create button is clicked', async ({ accountPage }) => {
    await accountPage.openCreateAccountDialog();
    await expect(await accountPage.getCreateDialog()).toBeVisible();
  });

  test('should close dialog when cancel button is clicked', async ({ accountPage }) => {
    await accountPage.openCreateAccountDialog();
    await accountPage.closeDialog();
    await expect(await accountPage.getCreateDialog()).not.toBeVisible();
  });

  test('should fill account name field', async ({ accountPage }) => {
    await accountPage.openCreateAccountDialog();
    await accountPage.fillAccountName('Test Savings');
    await expect(await accountPage.getAccountNameInput()).toHaveValue('Test Savings');
  });

  test('should fill initial balance field', async ({ accountPage }) => {
    await accountPage.openCreateAccountDialog();
    await accountPage.fillInitialBalance(1000000);
    const value = await (await accountPage.getInitialBalanceInput()).inputValue();
    expect(value).toBe('1000000');
  });

  // ========== END-TO-END CREATION TEST WITH CLEANUP ==========

  test('should create account with name and balance and display in table', async ({
    accountPage,
    accountAPI,
  }) => {
    // Arrange
    const testData = {
      name: 'TEST_E2E_Savings_Account',
      type: 'E-Wallet',
      balance: 50000,
      currency: 'USD',
    };

    // Act & Assert
    await createAccountE2E(accountPage, testData);

    // Additional verification: Check via API
    logger.step(8, 'Verify account via API');
    const createdAccount = await accountAPI.findByName(testData.name);
    expect(createdAccount).not.toBeNull();
    expect(createdAccount?.accountName || createdAccount?.name).toBe(testData.name);
    expect(createdAccount?.initBalance || createdAccount?.balance).toBe(testData.balance);

    // Cleanup message
    logger.success(`Test passed! Account will be auto-cleaned by fixture`);
  });
});
