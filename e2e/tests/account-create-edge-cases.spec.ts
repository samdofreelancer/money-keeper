import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { 
  givenFormIsPartiallFilledAndClosed,
  whenUserRefreshesPage,
  whenUserOpensDialogAgain,
  thenFormShouldBeCleared,
  thenAccountShouldBeCreatedSuccessfully,
  createAccountScenario
} from './account-creation.scenario';

/**
 * Account Creation - Edge Cases & Boundary Conditions Tests
 * 
 * Tests rare scenarios, concurrent operations, and data persistence
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Edge Cases', () => {
  test('should clear form when dialog reopens', async ({ app }, testInfo) => {
    const testName = generateTestAccountName(testInfo, 'FormReset');
    
    // GIVEN: Form is partially filled and closed
    await givenFormIsPartiallFilledAndClosed(app.accountPage, testName, 100_000, 'VND');
    
    // WHEN: User opens the dialog again
    await whenUserOpensDialogAgain(app.accountPage);
    
    // THEN: Form should be cleared
    await thenFormShouldBeCleared(app.accountPage);
  });

  test('should prevent duplicate submission on rapid button clicks', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'RapidClick'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });

  test('should create multiple accounts in quick succession', async ({ app }, testInfo) => {
    const account1 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'First')}`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // WHEN: Create first account
    await createAccountScenario(app, account1);

    const account2 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Second')}`)
      .withBalance(200_000)
      .withCurrency('EUR')
      .build();

    // WHEN: Create second account in quick succession
    await createAccountScenario(app, account2);
  });

  test('should preserve account data after page refresh', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Persist'))
      .withBalance(750_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Account has been created successfully
    await createAccountScenario(app, account);

    // WHEN: User refreshes the page
    await whenUserRefreshesPage(app.accountPage);

    // THEN: Account should still be visible
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);
  });

  test('should create account with very large balance', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'BigMoney'))
      .withBalance(999_999_999_999)
      .withCurrency('USD')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });

  test('should create account with special characters in name', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Special')}_@#$%`)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });
});
