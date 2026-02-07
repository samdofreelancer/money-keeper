import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { 
  givenFormIsPartiallFilledAndClosed,
  givenAccountHasBeenCreated,
  givenFormIsOpenAndFilled,
  whenUserRapidClicksSubmitButton,
  whenUserRefreshesPage,
  whenUserOpensDialogAgain,
  whenUserSubmitsForm,
  thenOnlyOneAccountShouldBeCreated,
  thenAccountShouldBeCreatedSuccessfully,
  thenFormShouldBeCleared
} from './account-creation.scenario';

/**
 * Account Creation - Edge Cases & Boundary Conditions Tests
 * 
 * Tests rare scenarios, concurrent operations, and data persistence
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Edge Cases', () => {
  test('should clear form when dialog reopens', async ({ app, accountAPI }, testInfo) => {
    const testName = generateTestAccountName(testInfo, 'FormReset');
    
    // GIVEN: Form is partially filled and closed
    await givenFormIsPartiallFilledAndClosed(app.accountPage, testName, 100_000, 'VND');
    
    // WHEN: User opens the dialog again
    await whenUserOpensDialogAgain(app.accountPage);
    
    // THEN: Form should be cleared
    await thenFormShouldBeCleared(app.accountPage);
  });

  test('should prevent duplicate submission on rapid button clicks', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'RapidClick'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Form is open and filled with valid data
    await givenFormIsOpenAndFilled(app.accountPage, account.name, account.initialBalance, account.currency);

    // WHEN: User rapid-clicks submit button
    await whenUserRapidClicksSubmitButton(app.accountPage);

    // THEN: Should only create one account (dialog closes)
    await thenOnlyOneAccountShouldBeCreated(app.accountPage, account.name);
  });

  test('should create multiple accounts in quick succession', async ({ app, accountAPI }, testInfo) => {
    const account1 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'First')}`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // WHEN: Create first account (full cycle: setup → action → verify)
    await givenAccountHasBeenCreated(app.accountPage, account1);

    const account2 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Second')}`)
      .withBalance(200_000)
      .withCurrency('EUR')
      .build();

    // WHEN: Create second account in quick succession (verify system handles rapid creates)
    await givenAccountHasBeenCreated(app.accountPage, account2);
  });

  test('should preserve account data after page refresh', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Persist'))
      .withBalance(750_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Account has been created successfully
    await givenAccountHasBeenCreated(app.accountPage, account);

    // WHEN: User refreshes the page
    await whenUserRefreshesPage(app.accountPage);

    // THEN: Account should still be visible
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);
  });

  test('should create account with very large balance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'BigMoney'))
      .withBalance(999_999_999_999)
      .withCurrency('USD')
      .build();

    // GIVEN: Form is open and filled with valid data (very large balance)
    await givenFormIsOpenAndFilled(app.accountPage, account.name, account.initialBalance, account.currency);
    
    // WHEN: User submits form
    await whenUserSubmitsForm(app.accountPage);
    
    // THEN: Account should be created successfully
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);
  });

  test('should create account with special characters in name', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Special')}_@#$%`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Form is open and filled with valid data (special characters in name)
    await givenFormIsOpenAndFilled(app.accountPage, account.name, account.initialBalance, account.currency);
    
    // WHEN: User submits form
    await whenUserSubmitsForm(app.accountPage);
    
    // THEN: Account should be created successfully
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);
  });
});
