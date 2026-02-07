import { test, expect } from '@/fixtures/test-fixture';
import {
  userCreatesAccountSuccessfully,
  userCancelsAccountCreation,
  userFillsFormFieldsIndividually,
} from './scenarios/account-creation.scenarios';

/**
 * Account Creation Tests
 * 
 * Tests for the create account dialog covering:
 * - Dialog opening/closing
 * - Form field filling
 * - Complete account creation flow
 * - Error handling and validation
 * 
 * ✅ Automatic cleanup: All test accounts (TEST_ prefix) deleted after each test
 * ✅ Uses BDD-style scenarios for clear test documentation
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
    await userCancelsAccountCreation(accountPage);
  });

  test('should fill account name field', async ({ accountPage }) => {
    await accountPage.openCreateAccountDialog();
    await userFillsFormFieldsIndividually(accountPage, { name: 'Test Savings' });
  });

  test('should fill initial balance field', async ({ accountPage }) => {
    await accountPage.openCreateAccountDialog();
    await userFillsFormFieldsIndividually(accountPage, { balance: 1000000 });
  });

  // ========== END-TO-END CREATION TEST WITH CLEANUP ==========

  test('should create account with name and balance and display in table', async ({
    accountPage,
    accountAPI,
  }) => {
    const testData = {
      name: 'TEST_E2E_Savings_Account',
      type: 'E-Wallet',
      balance: 50000,
      currency: 'USD',
    };

    await userCreatesAccountSuccessfully(accountPage, accountAPI, testData);
  });
});
