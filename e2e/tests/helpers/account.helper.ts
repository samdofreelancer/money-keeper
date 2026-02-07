import { expect, Locator } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { logger } from '@/utils/logger';

/**
 * Test Helpers for Account Tests
 * 
 * Contains reusable test utilities following DRY principle
 */

/**
 * Setup steps common to multiple tests
 */
export async function setupAccountPage(accountPage: AccountPage): Promise<void> {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
  await expect(await accountPage.getCreateDialog()).toBeVisible();
}

/**
 * Verify form field was filled correctly
 */
export async function verifyFormFieldValue(
  locator: Locator,
  expectedValue: string
): Promise<void> {
  const value = await locator.inputValue();
  expect(value).toBe(expectedValue);
}

/**
 * Fill all account form fields
 */
export async function fillAccountForm(
  accountPage: AccountPage,
  data: {
    name: string;
    type: string;
    balance: number;
    currency: string;
  }
): Promise<void> {
  logger.step(1, 'Fill account name');
  await accountPage.fillAccountName(data.name);

  logger.step(2, 'Select account type');
  await accountPage.selectAccountType(data.type);

  logger.step(3, 'Fill initial balance');
  await accountPage.fillInitialBalance(data.balance);

  logger.step(4, 'Select currency');
  await accountPage.selectCurrency(data.currency);
}

/**
 * Complete account creation flow (navigate + fill + submit + verify)
 */
export async function createAccountE2E(
  accountPage: AccountPage,
  data: {
    name: string;
    type: string;
    balance: number;
    currency: string;
  }
): Promise<void> {
  // Setup
  logger.section('Creating Account');
  logger.info(`Name: ${data.name}`);
  logger.info(`Type: ${data.type}`);
  logger.info(`Balance: ${data.balance}`);
  logger.info(`Currency: ${data.currency}`);

  // Navigate
  logger.step(0, 'Navigate to accounts page');
  await accountPage.navigateToAccounts();

  // Open dialog
  logger.step(0.5, 'Open create dialog');
  await accountPage.openCreateAccountDialog();

  // Fill form
  await fillAccountForm(accountPage, data);

  // Submit
  logger.step(5, 'Submit form');
  await accountPage.submitCreateAccountForm();

  // Verify dialog closed
  logger.step(6, 'Verify dialog closed');
  await expect(await accountPage.getCreateDialog()).not.toBeVisible();

  // Verify in table
  logger.step(7, 'Verify account in table');
  const found = await accountPage.waitForAccountInTable(data.name, 10000);
  expect(found).toBe(true);

  logger.success(`Account "${data.name}" created successfully`);
}
