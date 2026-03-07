import { AccountPage } from '@/pages/AccountPage';
import { expect } from '@playwright/test';
import { logger } from '@/utils/logger';

/**
 * Assertion: Account Exists in Table
 *
 * Verifies that an account appears in the account list.
 * Uses table content (UI) to verify, not API.
 *
 * Usage:
 *   await expectAccountExists(accountPage, 'My Savings');
 */
export async function expectAccountExists(
  accountPage: AccountPage,
  accountName: string
) {
  logger.info(`Expecting account to exist: ${accountName}`);

  const exists = await accountPage.waitForAccountInTable(accountName);
  expect(exists).toBe(true);

  logger.success(`Account exists: ${accountName}`);
}

