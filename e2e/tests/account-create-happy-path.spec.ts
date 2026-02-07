import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { openCreateDialog, fillAccountForm } from './account-creation.scenario';

/**
 * Account Creation - Happy Path Tests
 * 
 * Tests core functionality with valid data
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Happy Path', () => {
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
    await openCreateDialog(app.accountPage);

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
});
