import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import {
  givenFormWithEmptyName,
  givenFormWithInvalidBalance,
  givenFormWithWhitespaceName,
  givenFormWithDangerousInput,
  givenFormWithOversizedName,
  givenFormWithUndersizedName,
  givenAccountFormIsOpen,
  givenFormIsFilledWithValidData,
  givenAccountHasBeenCreated,
  whenUserSubmitsForm,
  thenFormShouldBeRejected
} from './account-creation.scenario';

/**
 * Account Creation - Error Cases & Validation Tests
 * 
 * Tests form validation, business rule violations, and error handling
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Error Cases', () => {
  test('should display empty account name validation error', async ({ app, accountAPI }, testInfo) => {
    // GIVEN
    await givenFormWithEmptyName(app.accountPage);
    // WHEN
    await whenUserSubmitsForm(app.accountPage);
    // THEN
    await thenFormShouldBeRejected(app.accountPage);
  });

  test('should display validation error when balance is negative or zero', async ({ app, accountAPI }, testInfo) => {
    // GIVEN
    await givenFormWithInvalidBalance(app.accountPage, testInfo);
    // WHEN
    await whenUserSubmitsForm(app.accountPage);
    // THEN
    await thenFormShouldBeRejected(app.accountPage);
  });

  test('should display error when account name already exists', async ({ app, accountAPI }, testInfo) => {
    // GIVEN: An account has been created with a specific name
    const accountName = generateTestAccountName(testInfo, 'Duplicate');
    const account = AccountBuilder.create()
      .withName(accountName)
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await givenAccountHasBeenCreated(app.accountPage, account);

    // AND: Form is open and filled with the same account name (duplicate)
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, accountName, 200_000, 'USD');
    
    // WHEN: User submits form with duplicate name
    await whenUserSubmitsForm(app.accountPage);
    
    // THEN: Form should be rejected
    await thenFormShouldBeRejected(app.accountPage);
  });

  test('should validate account name with maximum length', async ({ app, accountAPI }, testInfo) => {
    // GIVEN
    await givenFormWithOversizedName(app.accountPage, testInfo);
    // WHEN
    await whenUserSubmitsForm(app.accountPage);
    // THEN
    await thenFormShouldBeRejected(app.accountPage);
  });

  test('should reject account name with only whitespace', async ({ app, accountAPI }) => {
    // GIVEN
    await givenFormWithWhitespaceName(app.accountPage);
    // WHEN
    await whenUserSubmitsForm(app.accountPage);
    // THEN
    await thenFormShouldBeRejected(app.accountPage);
  });

  test('should sanitize dangerous input in account name', async ({ app, accountAPI }, testInfo) => {
    // GIVEN
    await givenFormWithDangerousInput(app.accountPage, testInfo);
    // WHEN
    await whenUserSubmitsForm(app.accountPage);
    // THEN
    await thenFormShouldBeRejected(app.accountPage);
  });

  test('should validate minimum account name length', async ({ app, accountAPI }, testInfo) => {
    // GIVEN
    await givenFormWithUndersizedName(app.accountPage, testInfo);
    // WHEN
    await whenUserSubmitsForm(app.accountPage);
    // THEN
    await thenFormShouldBeRejected(app.accountPage);
  });
});
