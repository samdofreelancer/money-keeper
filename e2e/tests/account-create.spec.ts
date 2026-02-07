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

    // Act 1: Navigate to accounts page
    await accountPage.navigateToAccounts();

    // Act 2: Open create dialog
    await accountPage.openCreateAccountDialog();
    await expect(await accountPage.getCreateDialog()).toBeVisible();

    // Act 3: Fill in account details
    console.log('📝 Filling account name:', accountName);
    await accountPage.fillAccountName(accountName);
    
    console.log('📝 Selecting account type:', accountType);
    await accountPage.selectAccountType(accountType);
    
    console.log('📝 Filling initial balance:', initialBalance);
    await accountPage.fillInitialBalance(initialBalance);
    
    console.log('📝 Selecting currency:', currency);
    await accountPage.selectCurrency(currency);

    // Assert 1: Verify form fields were filled
    console.log('✓ Verifying form fields...');
    await expect(await accountPage.getAccountNameInput()).toHaveValue(accountName);
    const balanceValue = await (
      await accountPage.getInitialBalanceInput()
    ).inputValue();
    expect(balanceValue).toBe(initialBalance.toString());

    // Debug: Log form field values
    const formValues = await accountPage.getFormFieldValues();
    console.log('📊 Form values before submission:', formValues);

    // Act 4: Submit the form
    console.log('🚀 Submitting form...');
    await accountPage.submitCreateAccountForm();

    // Assert 2: Verify dialog is closed after submission
    console.log('✓ Verifying dialog closed...');
    await expect(await accountPage.getCreateDialog()).not.toBeVisible();

    // Assert 3: Verify account appears in the table
    console.log('⏳ Waiting for account to appear in table...');
    const accountInTable = await accountPage.waitForAccountInTable(
      accountName,
      10000
    );
    expect(accountInTable).toBe(true);

    // Assert 4: Verify account exists via API
    console.log('🔍 Verifying account via API...');
    const createdAccount = await accountAPI.findByName(accountName);
    expect(createdAccount).not.toBeNull();
    expect(createdAccount?.accountName || createdAccount?.name).toBe(accountName);
    expect(createdAccount?.initBalance || createdAccount?.balance).toBe(
      initialBalance
    );

    // ✅ Cleanup: Automatic cleanup via fixture
    console.log(
      `✅ Test passed! Created account: ${accountName} (will be auto-cleaned)`
    );
  });
});
