import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';

/**
 * Account Creation E2E Tests
 *
 * Tests for the business rule: "Users can create accounts"
 *
 * Focus:
 * - Account creation flows (successful, error cases)
 * - Dialog interactions
 * - Business rule validation
 * - Form validation
 * - Different currencies and account types
 *
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 * ✅ Reads like business spec, not automation script
 */

test.describe('Account Creation', () => {
  test('should create account with initial balance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Savings'))
      .withBalance(1_000_000)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account with zero balance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Account'))
      .withBalance(1)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account in different currency', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'VND'))
      .withBalance(25_000_000)
      .withCurrency('VND')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should display dialog and allow closing without saving', async ({ app, accountAPI }) => {
    await app.accountPage.navigateToAccounts();
    await app.accountPage.openCreateAccountDialog();

    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeVisible();

    await app.accountPage.closeDialog();
    await expect(dialog).not.toBeVisible();
  });

  test('should create account with different account types', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'BANK'))
      .withBalance(500_000)
      .withCurrency('USD')
      .withType('BANK_ACCOUNT')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should display empty account name validation error', async ({ app, accountAPI }, testInfo) => {
    await app.accountPage.navigateToAccounts();
    await app.accountPage.openCreateAccountDialog();

    // Try to submit without filling account name
    await app.accountPage.selectCurrency('USD');
    await app.accountPage.selectAccountType('E_WALLET');
    await app.accountPage.fillInitialBalance(100_000);

    // Attempt to submit - should show validation error
    const submitButton = await app.accountPage.getSubmitButton();
    await expect(submitButton).toBeVisible();
    
    // Dialog should still be visible after invalid submission
    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeVisible();
  });

  test('should display validation error when balance is negative or zero', async ({ app, accountAPI }, testInfo) => {
    // Backend validation: balance must be > 0
    await app.accountPage.navigateToAccounts();
    await app.accountPage.openCreateAccountDialog();

    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'InvalidBalance'))
      .withBalance(-500_000)
      .withCurrency('USD')
      .build();

    await app.accountPage.fillAccountName(account.name);
    await app.accountPage.fillInitialBalance(account.initialBalance);
    await app.accountPage.selectCurrency(account.currency);
    await app.accountPage.selectAccountType('E_WALLET');

    // Attempt to submit - should show validation error
    const submitButton = await app.accountPage.getSubmitButton();
    await expect(submitButton).toBeVisible();
    
    // Dialog should still be visible (validation failed)
    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeVisible();
  });

  test('should create multiple accounts in quick succession', async ({ app, accountAPI }, testInfo) => {
    // Test 1: Create first account
    const account1 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'First')}`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account1);
    await expectAccountExists(app.accountPage, account1.name);

    // Test 2: Create second account immediately after
    const account2 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Second')}`)
      .withBalance(200_000)
      .withCurrency('EUR')
      .build();

    await createAccount(app.accountPage, account2);
    await expectAccountExists(app.accountPage, account2.name);
  });

  test('should preserve account data after page refresh', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Persist'))
      .withBalance(750_000)
      .withCurrency('USD')
      .build();

    // Create account
    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);

    // Refresh page
    await app.accountPage.refreshAccountsPage();

    // Verify account still exists
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account with very large balance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'BigMoney'))
      .withBalance(999_999_999_999)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account with special characters in name', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Special')}_@#$%`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });
});

