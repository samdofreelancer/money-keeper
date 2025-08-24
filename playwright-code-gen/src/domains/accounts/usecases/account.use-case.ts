import { AccountsPlaywrightPage } from '../pages/accounts.playwright.page';
import { Logger } from '../../../shared/utilities/logger';
import { AccountCreateDto, AccountDto } from '../types/account.dto';
import { AccountApiClient } from '../api/account-api.client';
import { CurrencyConfig } from '../../../shared/config/currency.config';
import { CurrencyConstants } from '../../../shared/constants/currency.constants';
import { Service } from '../../../shared/di/decorators';

/**
 * Use case for account-related operations
 */
@Service({ scope: 'transient' })
export class AccountUseCase {
  constructor(
    private accountsPage: AccountsPlaywrightPage,
    private accountApiClient: AccountApiClient
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
   * Delete an account by name using the backend API
   */
  async deleteAccount(name: string) {
    Logger.info(`Deleting account via API: ${name}`);
    const result = await this.accountApiClient.deleteAccountByName(name);
    if (!result) {
      Logger.warn(`Failed to delete account via API: ${name}`);
    } else {
      Logger.info(`Successfully deleted account via API: ${name}`);
    }
  }

  /**
   * Create an account directly via backend API (bypassing UI)
   */
  async createAccountViaApi(accountData: AccountCreateDto) {
    Logger.info(`Creating account via API: ${accountData.accountName}`);
    try {
      const result = await this.accountApiClient.create(accountData);
      Logger.info(
        `Successfully created account via API: ${accountData.accountName}`
      );
      return result;
    } catch (error) {
      Logger.error(
        `Failed to create account via API: ${accountData.accountName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Reload the accounts page to refresh the account list
   */
  async reloadAccountsPage() {
    Logger.info('Reloading accounts page to refresh account list');
    await this.accountsPage.reload();
  }

  /**
   * Store the current total balance for later comparison
   */
  private initialTotalBalance: number = 0;

  /**
   * Get the current total balance as a number
   */
  private async getTotalBalanceAsNumber(): Promise<number> {
    const totalBalanceText = await this.accountsPage.getTotalBalance();

    // Use the currency parser utility for robust parsing
    const balance = CurrencyConfig.parseCurrency(
      totalBalanceText,
      CurrencyConstants.DEFAULT_LOCALE
    );

    if (balance === null) {
      throw new Error(
        `Could not extract balance from text: ${totalBalanceText}`
      );
    }

    return balance;
  }

  /**
   * Store the current balance for later comparison
   */
  async storeInitialBalance() {
    this.initialTotalBalance = await this.getTotalBalanceAsNumber();
  }

  /**
   * Verify that the total balance is greater than or equal to the expected amount
   */
  async verifyTotalBalance(expectedAmount: number) {
    const currentBalance = await this.getTotalBalanceAsNumber();

    // Verify the current balance is greater than or equal to the expected amount
    if (currentBalance < expectedAmount) {
      throw new Error(
        `Current balance ${CurrencyConstants.SYMBOLS.USD}${currentBalance} is less than expected amount ${CurrencyConstants.SYMBOLS.USD}${expectedAmount}`
      );
    }

    // If we have an initial balance stored, verify the current balance is greater than or equal to it
    if (this.initialTotalBalance > 0) {
      if (currentBalance < this.initialTotalBalance) {
        throw new Error(
          `Current balance ${CurrencyConstants.SYMBOLS.USD}${currentBalance} is less than initial balance ${CurrencyConstants.SYMBOLS.USD}${this.initialTotalBalance}`
        );
      }
      Logger.info(
        `Balance check: Initial: ${CurrencyConstants.SYMBOLS.USD}${this.initialTotalBalance}, Current: ${CurrencyConstants.SYMBOLS.USD}${currentBalance}, Expected: ${CurrencyConstants.SYMBOLS.USD}${expectedAmount}`
      );
    }
  }
}
