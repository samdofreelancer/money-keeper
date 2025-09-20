import { AccountsPlaywrightPage } from 'account-domains/pages/accounts.playwright.page';
import { Logger } from 'shared/utilities/logger';
import { AccountDto } from 'account-domains/types/account.dto';
import { Inject, Transient, TOKENS } from 'shared/di';

/**
 * Use case for account creation via UI interactions
 */
@Transient({ token: TOKENS.AccountCreationUiUseCase })
export class AccountCreationUiUseCase {
  constructor(
    @Inject(TOKENS.AccountsPlaywrightPage)
    private accountsPage: AccountsPlaywrightPage
  ) {}

  /**
   * Navigate to the categories page
   */
  async navigateToCategoriesPage() {
    await this.accountsPage.navigateToCategoriesPage();
  }

  /**
   * Click the Accounts tab on categories page
   */
  async clickAccountsTab() {
    await this.accountsPage.clickAccountsTab();
  }

  /**
   * Create a new account by filling form and submitting
   */
  async createAccount(accountData: AccountDto) {
    await this.clickAddAccountButton();
    await this.accountsPage.fillAccountForm(accountData);
    await this.clickCreateButton();
  }

  /**
   * Click the Add Account button
   */
  async clickAddAccountButton() {
    await this.accountsPage.clickAddAccountButton();
  }

  /**
   * Click the Create button
   */
  async clickCreateButton() {
    await this.accountsPage.clickCreateButton();
  }

  /**
   * Verify that an account was created successfully
   */
  async verifyAccountCreated(name: string) {
    const exists = await this.accountsPage.verifyAccountIsListed(name);
    if (!exists) {
      throw new Error(`Account ${name} was not found in the accounts list`);
    }
  }

  /**
   * Reload the accounts page to refresh the account list
   */
  async reloadAccountsPage() {
    Logger.info('Reloading accounts page to refresh account list');
    await this.accountsPage.reload();
  }
}
