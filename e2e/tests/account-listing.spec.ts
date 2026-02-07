import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import {
  givenAccountsPageIsOpen,
  thenAccountTableShouldBeVisible,
  createAccountScenario
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

  test('should display created account in list', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Account'))
      .withBalance(500_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Accounts page is open
    await givenAccountsPageIsOpen(app.accountPage);

    // WHEN: User creates account
    await createAccountScenario(app, account);

    logger.success('Account created and displayed in list');
  });

  test('should display multiple accounts', async ({ app }, testInfo) => {
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
    
    // WHEN: Create first account
    await createAccountScenario(app, account1);

    // AND: Create second account
    await createAccountScenario(app, account2);

    logger.success('Multiple accounts created and displayed in list');
  });
});

