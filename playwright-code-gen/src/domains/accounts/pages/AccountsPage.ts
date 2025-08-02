import { Page } from '@playwright/test';
import { AccountData } from '../types/account.types';

/**
 * Page object for the Accounts page
 */
export class AccountsPage {
  constructor(private page: Page) {}

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
  async fillAccountForm(accountData: AccountData) {
    // Fill account name
    await this.page.fill('input[placeholder="Enter account name"]', accountData.name);
    
    // Select account type
    await this.page.click('.el-select');
    await this.page.click(`span:text('${accountData.type}')`);
    
    // Fill balance
    await this.page.fill('input[type="number"]', accountData.balance.toString());
    
    // Fill description
    await this.page.fill('input[placeholder="Enter description (optional)"]', accountData.description);
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
   * Get the total balance text
   */
  async getTotalBalance(): Promise<string> {
    const balance = await this.page.textContent('text=Total Balance of Active Accounts:');
    if (!balance) throw new Error('Total balance element not found');
    return balance;
  }
  
  /**
   * Delete an account by name
   * @param accountName The name of the account to delete
   */
  async deleteAccount(accountName: string): Promise<void> {
    // Find the account in the list and click the delete button
    // This is a placeholder implementation - the actual selector would depend on the UI
    try {
      await this.page.click(`text=${accountName} >> .delete-account-button`);
      // Confirm deletion if there's a confirmation dialog
      await this.page.click('button:has-text("Confirm")');
    } catch (error) {
      // If the specific delete button is not found, try alternative approach
      // This might involve clicking on the account row and then a delete option
      console.warn(`Could not delete account ${accountName}:`, error);
    }
  }
}
