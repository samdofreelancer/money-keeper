import { expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { AccountAPI } from '@/api/AccountAPI';
import { logger } from '@/utils/logger';

/**
 * Account Creation E2E Scenarios
 * 
 * Behavior-driven test scenarios following Gherkin-style naming
 * These describe complete user journeys and business flows
 */

export interface AccountTestData {
  name: string;
  type: string;
  balance: number;
  currency: string;
}

/**
 * Scenario: User creates a new savings account successfully
 * 
 * Given: User is on the accounts page
 * When: User fills in account details and submits the form
 * Then: Account appears in the table and is persisted in the database
 */
export async function userCreatesAccountSuccessfully(
  accountPage: AccountPage,
  accountAPI: AccountAPI,
  testData: AccountTestData
): Promise<void> {
  logger.section('Scenario: User Creates Account Successfully');

  // Given: Navigate to accounts page
  logger.step(1, 'User navigates to accounts page');
  await accountPage.navigateToAccounts();

  // When: User opens create dialog and fills in details
  logger.step(2, 'User opens create account dialog');
  await accountPage.openCreateAccountDialog();
  await expect(await accountPage.getCreateDialog()).toBeVisible();

  logger.step(3, 'User fills in account details');
  logger.info(`  - Account name: ${testData.name}`);
  await accountPage.fillAccountName(testData.name);

  logger.info(`  - Account type: ${testData.type}`);
  await accountPage.selectAccountType(testData.type);

  logger.info(`  - Initial balance: ${testData.balance}`);
  await accountPage.fillInitialBalance(testData.balance);

  logger.info(`  - Currency: ${testData.currency}`);
  await accountPage.selectCurrency(testData.currency);

  // Verify form is filled
  logger.step(4, 'Verify form fields are correctly filled');
  await expect(await accountPage.getAccountNameInput()).toHaveValue(testData.name);
  const balanceValue = await (await accountPage.getInitialBalanceInput()).inputValue();
  expect(balanceValue).toBe(testData.balance.toString());

  // Submit form
  logger.step(5, 'User submits the form');
  await accountPage.submitCreateAccountForm();

  // Then: Verify account appears in table
  logger.step(6, 'Verify account appears in the table (UI)');
  await expect(await accountPage.getCreateDialog()).not.toBeVisible();
  const foundInTable = await accountPage.waitForAccountInTable(testData.name, 10000);
  expect(foundInTable).toBe(true);

  // Then: Verify account is persisted in database
  logger.step(7, 'Verify account is persisted in the database (API)');
  const createdAccount = await accountAPI.findByName(testData.name);
  expect(createdAccount).not.toBeNull();
  expect(createdAccount?.accountName).toBe(testData.name);
  expect(createdAccount?.initBalance).toBe(testData.balance);

  logger.success(`✓ Scenario completed: Account "${testData.name}" created successfully`);
}

/**
 * Scenario: User cancels account creation
 * 
 * Given: User is on the create account dialog
 * When: User clicks the cancel button
 * Then: Dialog closes and no account is created
 */
export async function userCancelsAccountCreation(accountPage: AccountPage): Promise<void> {
  logger.section('Scenario: User Cancels Account Creation');

  logger.step(1, 'User navigates to accounts page');
  await accountPage.navigateToAccounts();

  logger.step(2, 'User opens create account dialog');
  await accountPage.openCreateAccountDialog();
  await expect(await accountPage.getCreateDialog()).toBeVisible();

  logger.step(3, 'User clicks cancel button');
  await accountPage.closeDialog();

  logger.step(4, 'Verify dialog is closed');
  await expect(await accountPage.getCreateDialog()).not.toBeVisible();

  logger.success('✓ Scenario completed: Account creation cancelled');
}

/**
 * Scenario: User fills form fields one by one
 * 
 * Given: User is on the create account dialog
 * When: User fills in each form field individually
 * Then: Each field retains its value
 */
export async function userFillsFormFieldsIndividually(
  accountPage: AccountPage,
  testData: Partial<AccountTestData>
): Promise<void> {
  logger.section('Scenario: User Fills Form Fields Individually');

  logger.step(1, 'User navigates to accounts page');
  await accountPage.navigateToAccounts();

  logger.step(2, 'User opens create account dialog');
  await accountPage.openCreateAccountDialog();

  if (testData.name) {
    logger.step(3, `User fills account name: "${testData.name}"`);
    await accountPage.fillAccountName(testData.name);
    await expect(await accountPage.getAccountNameInput()).toHaveValue(testData.name);
  }

  if (testData.balance) {
    logger.step(4, `User fills initial balance: ${testData.balance}`);
    await accountPage.fillInitialBalance(testData.balance);
    const value = await (await accountPage.getInitialBalanceInput()).inputValue();
    expect(value).toBe(testData.balance.toString());
  }

  logger.success('✓ Scenario completed: All form fields filled successfully');
}
