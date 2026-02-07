import { AccountPage } from '@/pages/AccountPage';
import { AccountData } from '@/test-data/account.builder';
import { logger } from '@/utils/logger';

/**
 * Create Account Action
 *
 * Business action: "Create a new account"
 *
 * Orchestrates UI steps to complete account creation.
 * Does NOT assert - that's for assertions module.
 *
 * Usage:
 *   const account = AccountBuilder.create()
 *     .withName('My Savings')
 *     .withBalance(1_000_000)
 *     .build();
 *   await createAccount(accountPage, account);
 */
export async function createAccount(
  accountPage: AccountPage,
  account: AccountData
) {
  logger.info(`Creating account: ${account.name}`);

  await accountPage.navigateToAccounts();
  logger.debug('Navigated to accounts page');

  await accountPage.openCreateAccountDialog();
  logger.debug('Dialog opened');

  await accountPage.fillAccountName(account.name);
  logger.debug(`Filled account name: ${account.name}`);

  // Always fill initial balance, even if it's 0
  await accountPage.fillInitialBalance(account.initialBalance);
  logger.debug(`Filled initial balance: ${account.initialBalance}`);

  // Select currency - always required
  const currency = account.currency || 'USD';
  await accountPage.selectCurrency(currency);
  logger.debug(`Selected currency: ${currency}`);

  // Select account type - always required (use enum naming: E_WALLET, BANK_ACCOUNT)
  const type = account.type || 'E_WALLET';
  await accountPage.selectAccountType(type);
  logger.debug(`Selected account type: ${type}`);

  await accountPage.submitCreateAccountForm();
  logger.success(`Account created: ${account.name}`);
}

