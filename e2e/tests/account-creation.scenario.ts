import { Page } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { TestInfo } from '@playwright/test';
import { expect } from '@/fixtures/test-fixture';

/**
 * Common test scenarios for Account Creation
 * 
 * These are reusable setup/action sequences that reduce code duplication
 * and make tests more readable by describing intent rather than implementation
 */

/**
 * Open create account dialog
 */
export async function openCreateDialog(accountPage: AccountPage): Promise<void> {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
}

/**
 * Fill form with account details
 */
export async function fillAccountForm(
  accountPage: AccountPage,
  name: string,
  balance: number,
  currency: string,
  type: string = 'E_WALLET'
): Promise<void> {
  await accountPage.fillAccountName(name);
  await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType(type);
}

/**
 * Attempt form submission
 */
export async function attemptSubmit(accountPage: AccountPage): Promise<void> {
  const submitButton = await accountPage.getSubmitButton();
  await submitButton.click();
}

/**
 * Assert that form submission was rejected (validation failed)
 */
export async function assertFormRejected(accountPage: AccountPage): Promise<void> {
  const dialog = await accountPage.getCreateDialog();
  await expect(dialog).toBeVisible();
}

/**
 * Prepare form with empty name (validation test)
 */
export async function setupFormWithEmptyName(
  accountPage: AccountPage,
  balance: number = 100_000,
  currency: string = 'USD'
): Promise<void> {
  await openCreateDialog(accountPage);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType('E_WALLET');
  await accountPage.fillInitialBalance(balance);
  // Note: NOT filling account name - intentionally empty
}

/**
 * Prepare form with invalid balance (validation test)
 */
export async function setupFormWithInvalidBalance(
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

  await openCreateDialog(accountPage);
  await accountPage.fillAccountName(account.name);
  await accountPage.fillInitialBalance(account.initialBalance);
  await accountPage.selectCurrency(account.currency);
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * Prepare form with whitespace-only name (validation test)
 */
export async function setupFormWithWhitespaceName(
  accountPage: AccountPage,
  balance: number = 100_000,
  currency: string = 'USD'
): Promise<void> {
  await openCreateDialog(accountPage);
  await accountPage.fillAccountName('   \t\n   ');
  await accountPage.fillInitialBalance(balance);
  await accountPage.selectCurrency(currency);
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * Prepare form with dangerous input (security test)
 */
export async function setupFormWithDangerousInput(
  accountPage: AccountPage,
  testInfo: TestInfo,
  dangerousPattern: string = `<script>alert('xss')</script>`
): Promise<void> {
  const dangerousName = generateTestAccountName(testInfo, 'Danger') + dangerousPattern;
  
  await openCreateDialog(accountPage);
  await accountPage.fillAccountName(dangerousName);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.selectCurrency('USD');
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * Prepare form with oversized name (validation test)
 */
export async function setupFormWithOversizedName(
  accountPage: AccountPage,
  testInfo: TestInfo,
  extraLength: number = 200
): Promise<void> {
  const longName = generateTestAccountName(testInfo, 'LongName') + 'X'.repeat(extraLength);
  
  await openCreateDialog(accountPage);
  await accountPage.fillAccountName(longName);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.selectCurrency('USD');
  await accountPage.selectAccountType('E_WALLET');
}

/**
 * Prepare form with undersized name (validation test)
 */
export async function setupFormWithUndersizedName(
  accountPage: AccountPage,
  testInfo: TestInfo
): Promise<void> {
  const shortName = generateTestAccountName(testInfo, 'X');
  
  await openCreateDialog(accountPage);
  await accountPage.fillAccountName(shortName);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.selectCurrency('USD');
  await accountPage.selectAccountType('E_WALLET');
}
