import { test, expect } from '@/fixtures/test-fixture';
import { logger } from '@/utils/logger';

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
 */

test.describe('Create Account Dialog', () => {
  test('should open dialog when create button is clicked', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();
    await accountPage.openCreateAccountDialog();

    // Assert - verify dialog is visible
    await expect(await accountPage.getCreateDialog()).toBeVisible();
  });

  test('should close dialog when cancel button is clicked', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();
    await accountPage.openCreateAccountDialog();
    await accountPage.closeDialog();

    // Assert - verify dialog is hidden
    await expect(await accountPage.getCreateDialog()).not.toBeVisible();
  });

  test('should fill account name field', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();
    await accountPage.openCreateAccountDialog();
    await accountPage.fillAccountName('Test Savings');

    // Assert - verify value was set
    await expect(await accountPage.getAccountNameInput()).toHaveValue('Test Savings');
  });

  test('should fill initial balance field', async ({ accountPage }) => {
    // Act
    await accountPage.navigateToAccounts();
    await accountPage.openCreateAccountDialog();
    await accountPage.fillInitialBalance(1000000);

    // Assert - verify value was set
    const value = await (await accountPage.getInitialBalanceInput()).inputValue();
    expect(value).toBe('1000000');
  });

  // ========== END-TO-END CREATION TEST WITH CLEANUP ==========

  test('should create account with name and balance and display in table', async ({
    accountPage,
    accountAPI,
  }) => {
    // Arrange
    const accountName = 'TEST_E2E_Savings_Account';
    const initialBalance = 50000;
    const accountType = 'E-Wallet'; // Label from accountTypes constant
    const currency = 'USD'; // Supported currency

    logger.section('Account Creation E2E Test');

    // Act 1: Navigate to accounts page
    logger.step(1, 'Navigate to accounts page');
    await accountPage.navigateToAccounts();

    // Act 2: Open create dialog
    logger.step(2, 'Open create dialog');
    await accountPage.openCreateAccountDialog();
    await expect(await accountPage.getCreateDialog()).toBeVisible();

    // Act 3: Fill in account details
    logger.step(3, 'Fill account form');
    logger.info(`Account name: ${accountName}`);
    await accountPage.fillAccountName(accountName);
    
    logger.info(`Account type: ${accountType}`);
    await accountPage.selectAccountType(accountType);
    
    logger.info(`Initial balance: ${initialBalance}`);
    await accountPage.fillInitialBalance(initialBalance);
    
    logger.info(`Currency: ${currency}`);
    await accountPage.selectCurrency(currency);

    // Assert 1: Verify form fields were filled
    logger.step(4, 'Verify form fields');
    await expect(await accountPage.getAccountNameInput()).toHaveValue(accountName);
    const balanceValue = await (
      await accountPage.getInitialBalanceInput()
    ).inputValue();
    expect(balanceValue).toBe(initialBalance.toString());

    // Debug: Log form field values
    const formValues = await accountPage.getFormFieldValues();
    logger.object('Form values', formValues);

    // Act 4: Submit the form
    logger.step(5, 'Submit form');
    await accountPage.submitCreateAccountForm();

    // Assert 2: Verify dialog is closed after submission
    logger.step(6, 'Verify dialog closed');
    await expect(await accountPage.getCreateDialog()).not.toBeVisible();

    // Assert 3: Verify account appears in the table
    logger.step(7, 'Verify account in table');
    const accountInTable = await accountPage.waitForAccountInTable(
      accountName,
      10000
    );
    expect(accountInTable).toBe(true);

    // Assert 4: Verify account exists via API
    logger.step(8, 'Verify account via API');
    const createdAccount = await accountAPI.findByName(accountName);
    expect(createdAccount).not.toBeNull();
    expect(createdAccount?.accountName || createdAccount?.name).toBe(accountName);
    expect(createdAccount?.initBalance || createdAccount?.balance).toBe(
      initialBalance
    );

    // ✅ Cleanup: Automatic cleanup via fixture
    logger.success(`Test passed! Created account: ${accountName} (will be auto-cleaned)`);
  });
});
