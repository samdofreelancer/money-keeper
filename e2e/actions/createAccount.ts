import { AccountPage } from '@/pages/AccountPage';
import { AccountData } from '@/test-data/account.builder';

/**
 * Create Account Action
 * 
 * Represents the business action: "create a new account"
 * 
 * Orchestrates multiple page objects to complete the flow.
 * Does NOT assert results - that's for assertions module.
 * 
 * Usage:
 *   const account = AccountBuilder.withBalance(1_000_000).build();
 *   await createAccount(accountPage, account);
 */
export async function createAccount(
  accountPage: AccountPage,
  account: AccountData
) {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
  await accountPage.fillAccountName(account.name);
  await accountPage.fillInitialBalance(account.initialBalance);
  // Note: Currency selection requires Element UI select handling (future enhancement)
}

