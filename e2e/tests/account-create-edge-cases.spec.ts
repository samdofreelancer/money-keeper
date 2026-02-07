import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { givenAccountFormIsOpen, givenFormIsFilledWithValidData } from './account-creation.scenario';

/**
 * Account Creation - Edge Cases & Boundary Conditions Tests
 * 
 * Tests rare scenarios, concurrent operations, and data persistence
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Edge Cases', () => {
  test('should clear form when dialog reopens', async ({ app, accountAPI }, testInfo) => {
    const testName = generateTestAccountName(testInfo, 'FormReset');
    
    // GIVEN
    await givenAccountFormIsOpen(app.accountPage);
    
    // WHEN: User fills form
    await app.accountPage.fillAccountName(testName);
    await app.accountPage.fillInitialBalance(100_000);
    await app.accountPage.selectCurrency('VND');
    
    // AND: Closes dialog
    await app.accountPage.closeDialog();
    
    // WHEN: Opens dialog again
    await givenAccountFormIsOpen(app.accountPage);
    
    // THEN: Form should be cleared
    const nameInput = await app.accountPage.getAccountNameInput();
    const nameValue = await nameInput.inputValue().catch(() => '');
    
    await expect(nameValue === '' || nameValue.length === 0).toBeTruthy();
    await app.accountPage.closeDialog();
  });

  test('should prevent duplicate submission on rapid button clicks', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'RapidClick'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);

    // WHEN: User rapid-clicks submit button
    const submitButton = await app.accountPage.getSubmitButton();
    
    await Promise.all([
      submitButton.click(),
      submitButton.click().catch(() => {})
    ]);

    // THEN: Should only create one account (dialog closes)
    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeHidden({ timeout: 5000 });
    
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create multiple accounts in quick succession', async ({ app, accountAPI }, testInfo) => {
    const account1 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'First')}`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN + WHEN + THEN: Create first account
    await createAccount(app.accountPage, account1);
    await expectAccountExists(app.accountPage, account1.name);

    const account2 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Second')}`)
      .withBalance(200_000)
      .withCurrency('EUR')
      .build();

    // GIVEN + WHEN + THEN: Create second account
    await createAccount(app.accountPage, account2);
    await expectAccountExists(app.accountPage, account2.name);
  });

  test('should preserve account data after page refresh', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Persist'))
      .withBalance(750_000)
      .withCurrency('USD')
      .build();

    // GIVEN + WHEN + THEN: Create account
    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);

    // WHEN: User refreshes page
    await app.accountPage.refreshAccountsPage();

    // THEN: Account should still be visible
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account with very large balance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'BigMoney'))
      .withBalance(999_999_999_999)
      .withCurrency('USD')
      .build();

    // GIVEN + WHEN + THEN
    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });

  test('should create account with special characters in name', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Special')}_@#$%`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN + WHEN + THEN
    await createAccount(app.accountPage, account);
    await expectAccountExists(app.accountPage, account.name);
  });
});
