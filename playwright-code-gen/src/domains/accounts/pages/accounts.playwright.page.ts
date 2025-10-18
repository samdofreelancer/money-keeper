import { Page, Response } from '@playwright/test';
import { Inject, Transient, TOKENS } from 'shared/di';
import { BasePage } from 'shared/pages/base.page';
import { Environment } from 'shared/config/environment';
import { AccountFormComponent } from './components/account-form.component';
import { AccountsNavigation } from './accounts-navigation.page'; // This import is already correct
import { AccountsActions } from './accounts-actions.page';
import { AccountsVerify } from '../verification/accounts.verify';
import { AccountsDataRetrieval } from './accounts-data-retrieval.page';

/**
 * Page object for the Accounts page
 */
@Transient({ token: TOKENS.AccountsPlaywrightPage })
export class AccountsPlaywrightPage extends BasePage {
  private navigation: AccountsNavigation;
  private actions: AccountsActions;
  private verification: AccountsVerify;
  private dataRetrieval: AccountsDataRetrieval;

  constructor(
    @Inject(TOKENS.Page) page: Page,
    @Inject(TOKENS.AccountFormComponent)
    public accountForm: AccountFormComponent
  ) {
    super(page);
    this.navigation = new AccountsNavigation(page);
    this.actions = new AccountsActions(page, accountForm);
    // Instantiate the page-level verification adapter. The verification
    // implementation (AccountsVerify) is registered in DI but the page
    // object expects a small verification surface; for now we keep the
    // thin adapter by instantiating AccountsVerify via the Page.
    this.verification = new AccountsVerify(page);
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

  /**
   * Wait for the account update API response
   */
  waitForAccountUpdateResponse(): Promise<Response> {
    return this.page.waitForResponse(
      resp =>
        resp.url().includes('/accounts/') && resp.request().method() === 'PUT',
      { timeout: Environment.accountUpdateTimeout }
    );
  }
}
