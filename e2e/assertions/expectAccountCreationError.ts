import { expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';

/**
 * Assertion: Account Creation Error
 * 
 * Verifies that an error message is displayed when account creation fails.
 * Common scenario: duplicate account name.
 * 
 * Usage:
 *   await expectAccountCreationError(accountPage, 'already exists');
 */
export async function expectAccountCreationError(
  accountPage: AccountPage,
  expectedErrorMessage: string
) {
  const errorText = await accountPage.getDialogErrorMessage();
  expect(errorText).toContain(expectedErrorMessage);
}
