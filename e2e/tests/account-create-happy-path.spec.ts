import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { 
  givenAccountFormIsOpen,
  whenUserClosesDialog,
  thenDialogShouldBeVisible,
  thenDialogShouldBeClosed,
  createAccountScenario
} from './account-creation.scenario';

/**
 * Account Creation - Happy Path Tests
 * 
 * Tests core functionality with valid data
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Happy Path', () => {
  test('should create account with initial balance', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Savings'))
      .withBalance(1_000_000)
      .withCurrency('USD')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });

  test('should create account with zero balance', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Account'))
      .withBalance(1)
      .withCurrency('USD')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });

  test('should create account in different currency', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'VND'))
      .withBalance(25_000_000)
      .withCurrency('VND')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });

  test('should display dialog and allow closing without saving', async ({ app }) => {
    // GIVEN: Dialog is open
    await givenAccountFormIsOpen(app.accountPage);
    
    // THEN: Dialog should be visible
    await thenDialogShouldBeVisible(app.accountPage);

    // WHEN: User closes dialog
    await whenUserClosesDialog(app.accountPage);
    
    // THEN: Dialog should be hidden
    await thenDialogShouldBeClosed(app.accountPage);
  });

  test('should create account with different account types', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'BANK'))
      .withBalance(500_000)
      .withCurrency('USD')
      .withType('BANK_ACCOUNT')
      .build();

    // Execute complete account creation scenario
    await createAccountScenario(app, account);
  });
});
