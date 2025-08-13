import { Page } from '@playwright/test';
import { AccountDto } from '../types/account.dto';
import { Logger } from '../../../shared/utilities/logger';
import { AccountsSelectors } from '../constants/accounts-selectors.constants';

/**
 * Page object for the Accounts page
 */
export class AccountsPlaywrightPage {
  constructor(private page: Page) {}

  /**
   * Navigate to the categories page
   */
  async navigateToCategoriesPage() {
    await this.page.goto(AccountsSelectors.navigation.categoriesPage);
  }

  /**
   * Click the "Accounts" tab or link on the categories page
   */
  async clickAccountsTab() {
    await this.page.click(AccountsSelectors.buttons.accountsTab);
  }

  /**
   * Navigate to the accounts page
   */
  async navigateToAccountsPage() {
    await this.page.goto(AccountsSelectors.navigation.accountsPage);
  }

  /**
   * Click the Add Account button
   */
  async clickAddAccountButton() {
    await this.page.click(AccountsSelectors.buttons.addAccount);
  }

  /**
   * Fill in the account name field
   */
  async fillAccountName(name: string) {
    await this.page.fill(AccountsSelectors.inputs.accountName, name);
  }

  /**
   * Select the account type from dropdown
   */
  async selectAccountType(type: string) {
    await this.page.click(AccountsSelectors.inputs.accountType);
    await this.page.click(AccountsSelectors.dynamic.accountTypeOption(type));
  }

  /**
   * Fill in the balance field
   */
  async fillBalance(balance: number) {
    await this.page.fill(AccountsSelectors.inputs.balance, balance.toString());
  }

  /**
   * Fill in the description field
   */
  async fillDescription(description: string) {
    await this.page.fill(AccountsSelectors.inputs.description, description || '');
  }

  /**
   * Fill in the account form by orchestrating individual field methods
   */
  async fillAccountForm(accountData: AccountDto) {
    await this.fillAccountName(accountData.name);
    await this.selectAccountType(accountData.type);
    await this.fillBalance(accountData.balance);
    if (accountData.description) {
      await this.fillDescription(accountData.description);
    }
  }

  /**
   * Click the Create button to submit the form
   */
  async clickCreateButton() {
    await this.page.click(AccountsSelectors.buttons.create);
  }

  /**
   * Verify that an account with the given name exists in the accounts list
   */
  async verifyAccountIsListed(name: string): Promise<boolean> {
    return await this.page.isVisible(AccountsSelectors.dynamic.accountByName(name));
  }

  /**
   * Check if success message is visible
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(AccountsSelectors.messages.success, {
        timeout: 5000,
        state: 'visible',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if error message with specific text is visible
   */
  async isErrorMessageVisible(errorMessage: string): Promise<boolean> {
    return await this.page.isVisible(AccountsSelectors.dynamic.accountByName(errorMessage));
  }

  /**
   * Get the total balance text
   */
  async getTotalBalance(): Promise<string> {
    const balance = await this.page.textContent(
      AccountsSelectors.text.totalBalanceLabel
    );
    if (!balance) throw new Error('Total balance element not found');
    return balance;
  }

  /**
   * Delete an account by name with proper error handling and structured logging
   * @param accountName The name of the account to delete
   */
  async deleteAccount(accountName: string): Promise<void> {
    try {
      Logger.info(`Attempting to delete account: ${accountName}`);

      // Find the account in the list and click the delete button
      await this.page.click(
        AccountsSelectors.dynamic.deleteButtonForAccount(accountName)
      );

      // Confirm deletion if there's a confirmation dialog
      await this.page.click(AccountsSelectors.buttons.confirm);

      Logger.info(
        `Successfully initiated deletion for account: ${accountName}`
      );
    } catch (error) {
      Logger.error(`Failed to delete account: ${accountName}`, error as Error);
      throw new Error(
        `Failed to delete account ${accountName}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get the count of accounts with a specific name
   */
  async getAccountCount(accountName: string): Promise<number> {
    const elements = await this.page.locator(AccountsSelectors.dynamic.accountByName(accountName)).all();
    return elements.length;
  }

  /**
   * Get the total number of accounts
   */
  async getTotalAccountCount(): Promise<number> {
    const rows = await this.page
      .locator(AccountsSelectors.accountElements.accountRow)
      .all();
    return rows.length;
  }

  /**
   * Get the description of an account
   */
  async getAccountDescription(accountName: string): Promise<string> {
    const descriptionSelector = AccountsSelectors.dynamic.accountRowWithName(accountName);
    const description = await this.page.textContent(descriptionSelector);
    return description || '';
  }

  /**
   * Reload the current page
   */
  async reload() {
    await this.page.reload();
  }
}
