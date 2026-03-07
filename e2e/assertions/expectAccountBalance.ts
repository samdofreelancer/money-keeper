import { AccountPage } from '@/pages/AccountPage';
import { logger } from '@/utils/logger';

/**
 * Assertion: Account Balance
 *
 * Verifies that an account displays the correct balance.
 * Uses table content (UI) to verify, not API.
 *
 * Usage:
 *   await expectAccountBalance(accountPage, 'My Savings', 1000000);
 */
export async function expectAccountBalance(
  accountPage: AccountPage,
  accountName: string,
  expectedBalance: number
) {
  logger.info(`Expecting account "${accountName}" to have balance: ${expectedBalance}`);

  // TODO: Implement balance retrieval from table
  // This requires parsing balance from table row
  throw new Error('expectAccountBalance not yet implemented - requires table parsing');
}

/**
 * Assertion: Account Currency
 *
 * Verifies that an account displays the correct currency.
 * Uses table content (UI) to verify, not API.
 *
 * Usage:
 *   await expectAccountCurrency(accountPage, 'My Savings', 'USD');
 */
export async function expectAccountCurrency(
  accountPage: AccountPage,
  accountName: string,
  expectedCurrency: string
) {
  logger.info(`Expecting account "${accountName}" to have currency: ${expectedCurrency}`);

  // TODO: Implement currency retrieval from table
  // This requires parsing currency from table row
  throw new Error(
    'expectAccountCurrency not yet implemented - requires table parsing'
  );
}

