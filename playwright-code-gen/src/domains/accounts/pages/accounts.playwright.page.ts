import { Page } from '@playwright/test';
import { AccountDto } from '../types/account.dto';

/**
 * Page object for the Accounts page
 */
export class AccountsPlaywrightPage {
  constructor(private page: Page) {}

  private selectors = {
    buttons: {
      addAccount: 'button:has-text("Add Account")',
      create: 'button:has-text("Create")',
      confirm: 'button:has-text("Confirm")',
      accountsTab: 'text=Accounts',
    },
    inputs: {
      accountName: 'input[placeholder="Enter account name"]',
      accountType: '.el-select',
      balance: 'input[type="number"]',
      description: 'input[placeholder="Enter description (optional)"]',
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
  }

  /**
   * Fill in the account form
   */
  async fillAccountForm(accountData: AccountDto) {
    // Fill account name
    await this.page.fill(
      this.selectors.inputs.accountName,
      accountData.name
    );

    // Select account type
    await this.page.click(this.selectors.inputs.accountType);
    await this.page.click(`span:text('${accountData.type}')`);

    // Fill balance
    await this.page.fill(
      this.selectors.inputs.balance,
      accountData.balance.toString()
    );

    // Fill description
    await this.page.fill(
      this.selectors.inputs.description,
      accountData.description || ''
    );
  }

  /**
   * Click the Create button to submit the form
   */
  async clickCreateButton() {
    await this.page.click(this.selectors.buttons.create);
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
   * Delete an account by name
   * @param accountName The name of the account to delete
   */
  async deleteAccount(accountName: string): Promise<void> {
    // Find the account in the list and click the delete button
    try {
      await this.page.click(`text=${accountName} >> ${this.selectors.accountElements.deleteButton}`);
      // Confirm deletion if there's a confirmation dialog
      await this.page.click(this.selectors.buttons.confirm);
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
    const rows = await this.page.locator(this.selectors.accountElements.accountRow).all();
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
   * Reload the current page
   */
  async reload() {
    await this.page.reload();
  }
}
