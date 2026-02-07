import { expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { logger } from '@/utils/logger';

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
  logger.info(`Expecting error message: ${expectedErrorMessage}`);

  const errorText = await accountPage.getDialogErrorMessage();
  expect(errorText).toBeTruthy();
  expect(errorText).toContain(expectedErrorMessage);

  logger.success(`Error message found: ${errorText}`);
}

