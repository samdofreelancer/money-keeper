import { Page } from '@playwright/test';
import { Inject, Transient, TOKENS } from 'shared/di';
import { BasePage } from 'shared/pages/base.page';
import { AccountFormComponent } from './components/account-form.component';
import { AccountsNavigation } from './accounts-navigation.page'; // This import is already correct
import { AccountsActions } from './accounts-actions.page';
import { AccountsVerification } from './accounts-verification.page';
import { AccountsDataRetrieval } from './accounts-data-retrieval.page';

/**
 * Page object for the Accounts page
 */
@Transient({ token: TOKENS.AccountsPlaywrightPage })
export class AccountsPlaywrightPage extends BasePage {
  private navigation: AccountsNavigation;
  private actions: AccountsActions;
  private verification: AccountsVerification;
  private dataRetrieval: AccountsDataRetrieval;

  constructor(
    @Inject(TOKENS.Page) page: Page,
    @Inject(TOKENS.AccountFormComponent)
    public accountForm: AccountFormComponent
  ) {
    super(page);
    this.navigation = new AccountsNavigation(page);
    this.actions = new AccountsActions(page, accountForm);
    this.verification = new AccountsVerification(page);
    this.dataRetrieval = new AccountsDataRetrieval(page);
  }

  // IAccountsNavigation
  navigateToCategoriesPage(): Promise<void> {
    return this.navigation.navigateToCategoriesPage();
  }

  clickAccountsTab(): Promise<void> {
    return this.navigation.clickAccountsTab();
  }

  navigateToAccountsPage(): Promise<void> {
    return this.navigation.navigateToAccountsPage();
  }

  // IAccountsActions
  clickAddAccountButton(): Promise<void> {
    return this.actions.clickAddAccountButton();
  }

  deleteAccount(accountName: string): Promise<void> {
    return this.actions.deleteAccount(accountName);
  }

  clickEditAccount(accountName: string): Promise<void> {
    return this.actions.clickEditAccount(accountName);
  }

  searchAccounts(query: string): Promise<void> {
    return this.actions.searchAccounts(query);
  }

  reload(): Promise<void> {
    return this.actions.reload();
  }

  clickColumnHeader(columnName: string): Promise<void> {
    return this.actions.clickColumnHeader(columnName);
  }

  // IAccountsVerification
  verifyAccountIsListed(name: string): Promise<boolean> {
    return this.verification.verifyAccountIsListed(name);
  }

  isSuccessMessageVisible(): Promise<boolean> {
    return this.verification.isSuccessMessageVisible();
  }

  isErrorMessageVisible(errorMessage: string): Promise<boolean> {
    return this.verification.isErrorMessageVisible(errorMessage);
  }

  verifyOnAccountsPage(): Promise<void> {
    return this.verification.verifyOnAccountsPage();
  }

  verifyAccountsSortedByBalance(
    balances: number[],
    order: 'asc' | 'desc'
  ): Promise<void> {
    return this.verification.verifyAccountsSortedByBalance(balances, order);
  }

  // IAccountsDataRetrieval
  getTotalBalance(): Promise<string> {
    return this.dataRetrieval.getTotalBalance();
  }

  getAccountCount(accountName: string): Promise<number> {
    return this.dataRetrieval.getAccountCount(accountName);
  }

  getTotalAccountCount(): Promise<number> {
    return this.dataRetrieval.getTotalAccountCount();
  }

  getAccountDescription(accountName: string): Promise<string> {
    return this.dataRetrieval.getAccountDescription(accountName);
  }

  getAccountBalanceForRow(accountName: string): Promise<string | null> {
    return this.dataRetrieval.getAccountBalanceForRow(accountName);
  }

  getSuccessMessageText(): Promise<string | null> {
    return this.dataRetrieval.getSuccessMessageText();
  }

  getVisibleAccountNames(): Promise<string[]> {
    return this.dataRetrieval.getVisibleAccountNames();
  }

  getAccountBalances(): Promise<number[]> {
    return this.dataRetrieval.getAccountBalances();
  }
}
