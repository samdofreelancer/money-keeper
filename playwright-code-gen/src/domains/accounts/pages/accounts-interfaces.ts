/**
 * Interface for navigation-related actions on the Accounts page
 */
export interface IAccountsNavigation {
  navigateToCategoriesPage(): Promise<void>;
  clickAccountsTab(): Promise<void>;
  navigateToAccountsPage(): Promise<void>;
}

/**
 * Interface for account-related actions on the Accounts page
 */
export interface IAccountsActions {
  clickAddAccountButton(): Promise<void>;
  deleteAccount(accountName: string): Promise<void>;
  clickEditAccount(accountName: string): Promise<void>;
  searchAccounts(query: string): Promise<void>;
  reload(): Promise<void>;
}

/**
 * Interface for verification methods on the Accounts page
 */
export interface IAccountsVerification {
  verifyAccountIsListed(name: string): Promise<boolean>;
  isSuccessMessageVisible(): Promise<boolean>;
  isErrorMessageVisible(errorMessage: string): Promise<boolean>;
  isOnAccountsPage(): Promise<boolean>;
}

/**
 * Interface for data retrieval methods on the Accounts page
 */
export interface IAccountsDataRetrieval {
  getTotalBalance(): Promise<string>;
  getAccountCount(accountName: string): Promise<number>;
  getTotalAccountCount(): Promise<number>;
  getAccountDescription(accountName: string): Promise<string>;
  getAccountBalanceForRow(accountName: string): Promise<string | null>;
  getSuccessMessageText(): Promise<string | null>;
  getVisibleAccountNames(): Promise<string[]>;
}
