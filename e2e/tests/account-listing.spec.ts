import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';

/**
 * Account Listing E2E Tests
 *
 * Tests for the business rule: "Users can view accounts"
 *
 * Focus:
 * - Account list displays correctly
 * - Accounts persist after creation
 * - List is updated after account operations
 *
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Listing', () => {
  test('should display accounts page', async ({ app }) => {
    await app.accountPage.navigateToAccounts();

    const table = await app.accountPage.getAccountTable();
    await expect(table).toBeVisible();

    logger.success('Accounts page displayed');
  });

  test('should display created account in list', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Account'))
      .withBalance(500_000)
      .withCurrency('USD')
      .build();

    await app.accountPage.navigateToAccounts();
    await app.accountPage.openCreateAccountDialog();
    await app.accountPage.fillAccountName(account.name);
    await app.accountPage.fillInitialBalance(account.initialBalance);
    await app.accountPage.selectCurrency(account.currency);
    await app.accountPage.selectAccountType(account.type || 'E_WALLET');
    await app.accountPage.submitCreateAccountForm();

    await expectAccountExists(app.accountPage, account.name);
  });

  test('should display multiple accounts', async ({ app, accountAPI }, testInfo) => {
    // Create first account via UI
    const account1 = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'First'))
      .withBalance(100_000)
      .build();

    await app.accountPage.navigateToAccounts();
    await app.accountPage.openCreateAccountDialog();
    await app.accountPage.fillAccountName(account1.name);
    await app.accountPage.fillInitialBalance(account1.initialBalance);
    await app.accountPage.selectCurrency(account1.currency);
    await app.accountPage.selectAccountType(account1.type || 'E_WALLET');
    await app.accountPage.submitCreateAccountForm();

    // Verify first account appears
    await expectAccountExists(app.accountPage, account1.name);

    // Create second account via UI
    const account2 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Second')}`)
      .withBalance(200_000)
      .build();

    await app.accountPage.openCreateAccountDialog();
    await app.accountPage.fillAccountName(account2.name);
    await app.accountPage.fillInitialBalance(account2.initialBalance);
    await app.accountPage.selectCurrency(account2.currency);
    await app.accountPage.selectAccountType(account2.type || 'E_WALLET');
    await app.accountPage.submitCreateAccountForm();

    // Verify both accounts appear in table
    await expectAccountExists(app.accountPage, account1.name);
    await expectAccountExists(app.accountPage, account2.name);
  });
});

