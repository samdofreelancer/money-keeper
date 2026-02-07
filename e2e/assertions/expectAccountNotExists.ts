import { AccountPage } from '@/pages/AccountPage';
import { expect } from '@playwright/test';
import { logger } from '@/utils/logger';

/**
 * Assertion: Account Does Not Exist
 *
 * Verifies that an account has been removed from the list.
 * Uses table content (UI) to verify, not API.
 *
 * Usage:
 *   await expectAccountNotExists(accountPage, 'Deleted Account');
 */
export async function expectAccountNotExists(
  accountPage: AccountPage,
  accountName: string
) {
  logger.info(`Expecting account NOT to exist: ${accountName}`);

  const exists = await accountPage.isAccountInTable(accountName);
  expect(exists).toBe(false);

  logger.success(`Account does not exist: ${accountName}`);
}

