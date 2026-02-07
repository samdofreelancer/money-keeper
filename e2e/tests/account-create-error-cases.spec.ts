import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import {
  setupFormWithEmptyName,
  setupFormWithInvalidBalance,
  setupFormWithWhitespaceName,
  setupFormWithDangerousInput,
  setupFormWithOversizedName,
  setupFormWithUndersizedName,
  attemptSubmit,
  openCreateDialog,
  fillAccountForm,
  assertFormRejected
} from './account-creation.scenario';

/**
 * Account Creation - Error Cases & Validation Tests
 * 
 * Tests form validation, business rule violations, and error handling
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Error Cases', () => {
  test('should display empty account name validation error', async ({ app, accountAPI }, testInfo) => {
    await setupFormWithEmptyName(app.accountPage);
    await assertFormRejected(app.accountPage);
  });

  test('should display validation error when balance is negative or zero', async ({ app, accountAPI }, testInfo) => {
    await setupFormWithInvalidBalance(app.accountPage, testInfo);
    await assertFormRejected(app.accountPage);
  });

  test('should display error when account name already exists', async ({ app, accountAPI }, testInfo) => {
    const accountName = generateTestAccountName(testInfo, 'Duplicate');
    const account = AccountBuilder.create()
      .withName(accountName)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, accountName);

    await openCreateDialog(app.accountPage);
    await fillAccountForm(app.accountPage, accountName, 200_000, 'USD');
    await assertFormRejected(app.accountPage);
  });

  test('should validate account name with maximum length', async ({ app, accountAPI }, testInfo) => {
    await setupFormWithOversizedName(app.accountPage, testInfo);
    await assertFormRejected(app.accountPage);
  });

  test('should reject account name with only whitespace', async ({ app, accountAPI }) => {
    await setupFormWithWhitespaceName(app.accountPage);
    await assertFormRejected(app.accountPage);
  });

  test('should sanitize dangerous input in account name', async ({ app, accountAPI }, testInfo) => {
    await setupFormWithDangerousInput(app.accountPage, testInfo);
    await assertFormRejected(app.accountPage);
  });

  test('should validate minimum account name length', async ({ app, accountAPI }, testInfo) => {
    await setupFormWithUndersizedName(app.accountPage, testInfo);
    await assertFormRejected(app.accountPage);
  });
});
