import { Page } from '@playwright/test';

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
  async fillAccountForm({
    name,
    type,
    balance,
    currency,
    description
  }: {
    name: string;
    type: string;
    balance: number;
    currency: string;
    description: string;
  }) {
    // Fill account name
    await this.page.fill('input[placeholder="Enter account name"]', name);
    
    // Select account type
    await this.page.click('.el-select');
    await this.page.click(`span:text('${type}')`);
    
    // Fill balance
    await this.page.fill('input[type="number"]', balance.toString());
    
    // Fill description
    await this.page.fill('input[placeholder="Enter description (optional)"]', description);
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
}