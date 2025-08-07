import { Page } from '@playwright/test';
import { AccountDto } from '../types/account.dto';

/**
 * Page object for the Accounts page
 */
export class AccountsPlaywrightPage {
  constructor(private page: Page) {}

  /**
   * Navigate to the categories page
   */
  async navigateToCategoriesPage() {
    await this.page.goto('/categories');
  }

  /**
   * Click the "Accounts" tab or link on the categories page
   */
  async clickAccountsTab() {
    await this.page.click('text=Accounts');
  }

  /**
   * Navigate to the accounts page
   */
  async navigate() {
    await this.page.goto('/accounts');
  }

  /**
   * Click the Add Account button
   */
  async clickAddAccount() {
    await this.page.click('button:has-text("Add Account")');
  }

  /**
   * Fill in the account form
   */
  async fillAccountForm(accountData: AccountDto) {
    // Fill account name
    await this.page.fill(
      'input[placeholder="Enter account name"]',
      accountData.name
    );

    // Select account type
    await this.page.click('.el-select');
    await this.page.click(`span:text('${accountData.type}')`);

    // Fill balance
    await this.page.fill(
      'input[type="number"]',
      accountData.balance.toString()
    );

    // Fill description
    await this.page.fill(
      'input[placeholder="Enter description (optional)"]',
      accountData.description || ''
    );
  }

  /**
   * Click the Create button to submit the form
   */
  async clickCreate() {
    await this.page.click('button:has-text("Create")');
  }

  /**
   * Verify that an account with the given name exists in the accounts list
   */
  async verifyAccountExists(name: string): Promise<boolean> {
    return await this.page.isVisible(`text=${name}`);
  }

  /**
   * Check if success message is visible
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector('.el-message--success', {
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
   * Delete an account by name
   * @param accountName The name of the account to delete
   */
  async deleteAccount(accountName: string): Promise<void> {
    // Find the account in the list and click the delete button
    try {
      await this.page.click(`text=${accountName} >> .delete-account-button`);
      // Confirm deletion if there's a confirmation dialog
      await this.page.click('button:has-text("Confirm")');
    } catch (error) {
      console.warn(`Could not delete account ${accountName}:`, error);
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
    const rows = await this.page.locator('.account-row').all();
    return rows.length;
  }

  /**
   * Get the description of an account
   */
  async getAccountDescription(accountName: string): Promise<string> {
    const descriptionSelector = `text=${accountName} >> .. >> .account-description`;
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
