import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import {
  givenAccountsPageIsOpen,
  givenAccountFormIsOpen,
  givenFormIsFilledWithValidData,
  givenAccountHasBeenCreated,
  whenUserSubmitsForm,
  thenAccountTableShouldBeVisible,
  thenAccountShouldBeCreatedSuccessfully
} from './account-creation.scenario';
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
    // GIVEN: User navigates to accounts page
    await givenAccountsPageIsOpen(app.accountPage);

    // THEN: Accounts table should be visible
    await thenAccountTableShouldBeVisible(app.accountPage);

    logger.success('Accounts page displayed');
  });

  test('should display created account in list', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Account'))
      .withBalance(500_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Accounts page is open and form is filled with valid data
    await givenAccountsPageIsOpen(app.accountPage);
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);
    
    // WHEN: User submits form
    await whenUserSubmitsForm(app.accountPage);

    // THEN: Account should appear in the list
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);
  });

  test('should display multiple accounts', async ({ app, accountAPI }, testInfo) => {
    const account1 = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'First'))
      .withBalance(100_000)
      .build();

    const account2 = AccountBuilder.create()
      .withName(`${generateTestAccountName(testInfo, 'Second')}`)
      .withBalance(200_000)
      .build();

    // GIVEN: Accounts page is open
    await givenAccountsPageIsOpen(app.accountPage);
    
    // WHEN: Create first account (verified immediately)
    await givenAccountHasBeenCreated(app.accountPage, account1);

    // AND: Create second account (verified immediately)
    await givenAccountHasBeenCreated(app.accountPage, account2);
  });
});

