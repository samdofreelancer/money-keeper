import { Page } from '@playwright/test';
import { AccountDto } from 'account-domains/types/account.dto';
import { Logger } from 'shared/utilities/logger';
import { Inject, Transient, TOKENS } from 'shared/di';
import { BasePage } from 'shared/pages/base.page';
import { AccountFormComponent } from './components/account-form.component';

/**
 * Page object for the Accounts page
 */
@Transient({ token: TOKENS.AccountsPlaywrightPage })
export class AccountsPlaywrightPage extends BasePage {
  constructor(
    @Inject(TOKENS.Page) page: Page,
    @Inject(TOKENS.AccountFormComponent) public accountForm: AccountFormComponent
  ) {
    super(page);
  }
  private selectors = {
    buttons: {
      addAccount: 'button:has-text("Add Account")',
      confirm: 'button:has-text("Confirm")',
      accountsTab: 'text=Accounts',
    },
    messages: {
      success: '.el-message--success',
    },
    accountElements: {
      accountRow: '.account-row',
      accountDescription: '.account-description',
      deleteButton: '.delete-account-button',
    },
    navigation: {
      categoriesPage: '/categories',
      accountsPage: '/accounts',
    },
    dialog: '.el-dialog',
  };

  /**
   * Navigate to the categories page
   */
  async navigateToCategoriesPage() {
    await this.page.goto(this.selectors.navigation.categoriesPage);
  }

  /**
   * Click the "Accounts" tab or link on the categories page
   */
  async clickAccountsTab() {
    await this.page.click(this.selectors.buttons.accountsTab);
  }

  /**
   * Navigate to the accounts page
   */
  async navigateToAccountsPage() {
    await this.page.goto(this.selectors.navigation.accountsPage);
  }

  /**
   * Click the Add Account button
   */
  async clickAddAccountButton() {
    await this.page.click(this.selectors.buttons.addAccount);
    await this.page.waitForSelector(this.selectors.dialog, {
      state: 'visible',
    });
  }

  /**
   * Verify that an account with the given name exists in the accounts list
   */
  async verifyAccountIsListed(name: string): Promise<boolean> {
    return await this.page.isVisible(`text=${name}`);
  }

  /**
   * Check if success message is visible
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.messages.success, {
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
    return await this.page.isVisible(`text=${errorMessage}`);
  }

  /**
   * Get the total balance text
   */
  async getTotalBalance(): Promise<string> {
    const balance = await this.page.textContent(
      'text=Total Balance of Active Accounts:'
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
        `text=${accountName} >> ${this.selectors.accountElements.deleteButton}`
      );

      // Confirm deletion if there's a confirmation dialog
      await this.page.click(this.selectors.buttons.confirm);

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
    const elements = await this.page.locator(`text=${accountName}`).all();
    return elements.length;
  }

  /**
   * Get the total number of accounts
   */
  async getTotalAccountCount(): Promise<number> {
    const rows = await this.page
      .locator(this.selectors.accountElements.accountRow)
      .all();
    return rows.length;
  }

  /**
   * Get the description of an account
   */
  async getAccountDescription(accountName: string): Promise<string> {
    const descriptionSelector = `text=${accountName} >> .. >> ${this.selectors.accountElements.accountDescription}`;
    const description = await this.page.textContent(descriptionSelector);
    return description || '';
  }

  /**
   * Get the balance for a given account row by name
   */
  async getAccountBalanceForRow(accountName: string): Promise<string | null> {
    // Find the row containing the account name
    const row = await this.page
      .locator(`tr:has(td:has-text("${accountName}"))`)
      .first();
    // The balance is typically in the 3rd cell (index 2)
    const balanceCell = await row.locator('td').nth(2).textContent();
    return balanceCell;
  }

  /**
   * Reload the current page
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * Verify that we're on the accounts page by checking for key elements
   */
  async verifyOnAccountsPage(): Promise<void> {
    await this.page.waitForSelector(this.selectors.buttons.addAccount, {
      timeout: 10000,
    });
  }

  /**
   * Get the text of the success message if visible
   */
  async getSuccessMessageText(): Promise<string | null> {
    const el = await this.page.$(this.selectors.messages.success);
    if (!el) return null;
    return (await el.textContent())?.trim() || null;
  }
}