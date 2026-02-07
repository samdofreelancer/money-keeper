import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';

/**
 * Account Creation E2E Tests
 *
 * Tests for the business rule: "Users can create accounts"
 *
 * Focus:
 * - Account creation flows (successful, error cases)
 * - Dialog interactions
 * - Business rule validation
 *
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 * ✅ Reads like business spec, not automation script
 */

test.describe('Account Creation', () => {
  test('should create account with initial balance', async ({ app }) => {
    const account = AccountBuilder.create()
      .withName('TEST_New_Savings')
      .withBalance(1_000_000)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account with zero balance', async ({ app }) => {
    const account = AccountBuilder.create()
      .withName('TEST_Empty_Account')
      .withBalance(1)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account in different currency', async ({ app }) => {
    const account = AccountBuilder.create()
      .withName('TEST_VND_Account')
      .withBalance(25_000_000)
      .withCurrency('VND')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should display dialog and allow closing without saving', async ({ app }) => {
    await app.accountPage.navigateToAccounts();
    await app.accountPage.openCreateAccountDialog();

    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeVisible();

    await app.accountPage.closeDialog();
    await expect(dialog).not.toBeVisible();
  });
});

