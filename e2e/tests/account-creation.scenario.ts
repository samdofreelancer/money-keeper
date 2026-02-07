import { Page } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { TestInfo } from '@playwright/test';
import { expect } from '@/fixtures/test-fixture';

/**
 * Account Creation - Test Scenarios (Given-When-Then)
 * 
 * Organized by test phase:
 * - GIVEN: Setup preconditions (given* functions)
 * - WHEN: Perform actions (when* functions)
 * - THEN: Verify outcomes (then* functions)
 */

// ===== GIVEN: Setup & Preconditions =====

/**
 * GIVEN: Account creation form is open
 */
export async function givenAccountFormIsOpen(accountPage: AccountPage): Promise<void> {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
}

/**
 * GIVEN: Form is filled with valid account data
 */
export async function givenFormIsFilledWithValidData(
  accountPage: AccountPage,
  name: string,
  balance: number,
  currency: string,
  type: string = 'E_WALLET'
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(name);
  await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType(type);
}

/**
 * GIVEN: Form with empty account name (validation test)
 */
export async function givenFormWithEmptyName(
  accountPage: AccountPage,
  balance: number = 100_000,
  currency: string = 'USD'
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType('E_WALLET');
  await accountPage.fillInitialBalance(balance);
  // Note: NOT filling account name - intentionally empty
}

/**
 * GIVEN: Form with invalid balance (negative/zero)
 */
export async function givenFormWithInvalidBalance(
  accountPage: AccountPage,
  testInfo: TestInfo,
  invalidBalance: number = -500_000,
  currency: string = 'USD'
): Promise<void> {
  const account = AccountBuilder.create()
    .withName(generateTestAccountName(testInfo, 'InvalidBalance'))
    .withBalance(invalidBalance)
    .withCurrency(currency)
    .build();

  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(account.name);
  await accountPage.fillInitialBalance(account.initialBalance);
  await accountPage.selectCurrency(account.currency);
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * GIVEN: Form with whitespace-only name
 */
export async function givenFormWithWhitespaceName(
  accountPage: AccountPage,
  balance: number = 100_000,
  currency: string = 'USD'
): Promise<void> {
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName('   \t\n   ');
  await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * GIVEN: Form with dangerous/malicious input (XSS test)
 */
export async function givenFormWithDangerousInput(
  accountPage: AccountPage,
  testInfo: TestInfo,
  dangerousPattern: string = `<script>alert('xss')</script>`
): Promise<void> {
  const dangerousName = generateTestAccountName(testInfo, 'Danger') + dangerousPattern;
  
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(dangerousName);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.selectCurrency('USD');
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * GIVEN: Form with oversized account name (max length test)
 */
export async function givenFormWithOversizedName(
  accountPage: AccountPage,
  testInfo: TestInfo,
  extraLength: number = 200
): Promise<void> {
  const longName = generateTestAccountName(testInfo, 'LongName') + 'X'.repeat(extraLength);
  
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(longName);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.selectCurrency('USD');
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * GIVEN: Form with undersized account name (min length test)
 */
export async function givenFormWithUndersizedName(
  accountPage: AccountPage,
  testInfo: TestInfo
): Promise<void> {
  const shortName = generateTestAccountName(testInfo, 'X');
  
  await givenAccountFormIsOpen(accountPage);
  await accountPage.fillAccountName(shortName);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.selectCurrency('USD');
  await accountPage.selectAccountType('E_WALLET');
}

// ===== WHEN: Actions =====

/**
 * WHEN: User submits the form
 */
export async function whenUserSubmitsForm(accountPage: AccountPage): Promise<void> {
  const submitButton = await accountPage.getSubmitButton();
  await submitButton.click();
}

// ===== THEN: Assertions & Verifications =====

/**
 * THEN: Form submission should be rejected (validation error occurred)
 */
export async function thenFormShouldBeRejected(accountPage: AccountPage): Promise<void> {
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeVisible();
}

/**
 * THEN: Account should be created successfully and appear in table
 */
export async function thenAccountShouldBeCreatedSuccessfully(
  accountPage: AccountPage,
  accountName: string
): Promise<void> {
  // Verify dialog closes (form submitted)
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeHidden({ timeout: 5000 });
  
  // Verify account appears in table
  const exists = await accountPage.waitForAccountInTable(accountName);
  expect(exists).toBe(true);
}

// ===== BACKWARD COMPATIBILITY ALIASES (Old naming convention) =====

/**
 * @deprecated Use givenAccountFormIsOpen instead
 */
export async function openCreateDialog(accountPage: AccountPage): Promise<void> {
  return givenAccountFormIsOpen(accountPage);
}

/**
 * @deprecated Use givenFormIsFilledWithValidData instead
 */
export async function fillAccountForm(
  accountPage: AccountPage,
  name: string,
  balance: number,
  currency: string,
  type: string = 'E_WALLET'
): Promise<void> {
  await givenFormIsFilledWithValidData(accountPage, name, balance, currency, type);
}

/**
 * @deprecated Use whenUserSubmitsForm instead
 */
export async function attemptSubmit(accountPage: AccountPage): Promise<void> {
  return whenUserSubmitsForm(accountPage);
}

/**
 * @deprecated Use thenFormShouldBeRejected instead
 */
export async function assertFormRejected(accountPage: AccountPage): Promise<void> {
  return thenFormShouldBeRejected(accountPage);
}

/**
 * @deprecated Use givenFormWithEmptyName instead
 */
export async function setupFormWithEmptyName(
  accountPage: AccountPage,
  balance: number = 100_000,
  currency: string = 'USD'
): Promise<void> {
  return givenFormWithEmptyName(accountPage, balance, currency);
}

/**
 * @deprecated Use givenFormWithInvalidBalance instead
 */
export async function setupFormWithInvalidBalance(
  accountPage: AccountPage,
  testInfo: TestInfo,
  invalidBalance: number = -500_000,
  currency: string = 'USD'
): Promise<void> {
  return givenFormWithInvalidBalance(accountPage, testInfo, invalidBalance, currency);
}

/**
 * @deprecated Use givenFormWithWhitespaceName instead
 */
export async function setupFormWithWhitespaceName(
  accountPage: AccountPage,
  balance: number = 100_000,
  currency: string = 'USD'
): Promise<void> {
  return givenFormWithWhitespaceName(accountPage, balance, currency);
}

/**
 * @deprecated Use givenFormWithDangerousInput instead
 */
export async function setupFormWithDangerousInput(
  accountPage: AccountPage,
  testInfo: TestInfo,
  dangerousPattern: string = `<script>alert('xss')</script>`
): Promise<void> {
  return givenFormWithDangerousInput(accountPage, testInfo, dangerousPattern);
}

/**
 * @deprecated Use givenFormWithOversizedName instead
 */
export async function setupFormWithOversizedName(
  accountPage: AccountPage,
  testInfo: TestInfo,
  extraLength: number = 200
): Promise<void> {
  return givenFormWithOversizedName(accountPage, testInfo, extraLength);
}

/**
 * @deprecated Use givenFormWithUndersizedName instead
 */
export async function setupFormWithUndersizedName(
  accountPage: AccountPage,
  testInfo: TestInfo
): Promise<void> {
  return givenFormWithUndersizedName(accountPage, testInfo);
}
