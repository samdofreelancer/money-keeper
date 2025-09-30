import { Page, Locator } from '@playwright/test';
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
    @Inject(TOKENS.AccountFormComponent)
    public accountForm: AccountFormComponent
  ) {
    super(page);
  }

  // Centralized selectors for maintainability
  private readonly selectors = {
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
      editButton: '.edit-account-button',
    },
    navigation: {
      categoriesPage: '/categories',
      accountsPage: '/accounts',
    },
    dialog: '.el-dialog',
    search: {
      searchInput: 'input[placeholder*="Search" i]',
      typeFilter: 'select[name="accountType"]',
    },
  } as const;

  // Locators for elements
  private get addAccountButton(): Locator {
    return this.page.locator(this.selectors.buttons.addAccount);
  }

  private get confirmButton(): Locator {
    return this.page.locator(this.selectors.buttons.confirm);
  }

  private get accountsTab(): Locator {
    return this.page.locator(this.selectors.buttons.accountsTab);
  }

  private get successMessage(): Locator {
    return this.page.locator(this.selectors.messages.success);
  }

  private get accountRows(): Locator {
    return this.page.locator(this.selectors.accountElements.accountRow);
  }

  private accountRowByName(accountName: string): Locator {
    return this.page.locator(`text=${accountName}`);
  }

  private get dialog(): Locator {
    return this.page.locator(this.selectors.dialog);
  }

  private get searchInput(): Locator {
    return this.page.locator(this.selectors.search.searchInput);
  }

  private deleteButtonForAccount(accountName: string): Locator {
    return this.page.locator(
      `text=${accountName} >> ${this.selectors.accountElements.deleteButton}`
    );
  }

  private editButtonForAccount(accountName: string): Locator {
    return this.page
      .locator(`tr:has(td:has-text("${accountName}"))`)
      .getByTestId('edit-account-button');
  }

  // Navigation methods
  async navigateToCategoriesPage() {
    await this.page.goto(this.selectors.navigation.categoriesPage);
  }

  async clickAccountsTab() {
    await this.accountsTab.click();
  }

  async navigateToAccountsPage() {
    await this.page.goto(this.selectors.navigation.accountsPage);
  }

  // Actions
  async clickAddAccountButton() {
    await this.addAccountButton.click();
    await this.dialog.waitFor({ state: 'visible' });
  }

  async verifyAccountIsListed(name: string): Promise<boolean> {
    return await this.page.isVisible(`text=${name}`);
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.successMessage.waitFor({ timeout: 5000, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  async isErrorMessageVisible(errorMessage: string): Promise<boolean> {
    return await this.page.isVisible(`text=${errorMessage}`);
  }

  async getTotalBalance(): Promise<string> {
    const balance = await this.page.textContent(
      'text=Total Balance of Active Accounts:'
    );
    if (!balance) throw new Error('Total balance element not found');
    return balance;
  }

  async deleteAccount(accountName: string): Promise<void> {
    try {
      Logger.info(`Attempting to delete account: ${accountName}`);
      await this.deleteButtonForAccount(accountName).click();
      await this.confirmButton.click();
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

  async getAccountCount(accountName: string): Promise<number> {
    const elements = await this.page.locator(`text=${accountName}`).all();
    return elements.length;
  }

  async getTotalAccountCount(): Promise<number> {
    return await this.accountRows.count();
  }

  async getAccountDescription(accountName: string): Promise<string> {
    const descriptionSelector = `text=${accountName} >> .. >> ${this.selectors.accountElements.accountDescription}`;
    const description = await this.page.textContent(descriptionSelector);
    return description || '';
  }

  async getAccountBalanceForRow(accountName: string): Promise<string | null> {
    const row = this.page
      .locator(`tr:has(td:has-text("${accountName}"))`)
      .first();
    const balanceCell = await row.locator('td').nth(2).textContent();
    return balanceCell;
  }

  async reload() {
    await this.page.reload();
  }

  async verifyOnAccountsPage(): Promise<void> {
    await this.addAccountButton.waitFor({ timeout: 10000 });
  }

  async clickEditAccount(accountName: string): Promise<void> {
    try {
      Logger.info(`Attempting to edit account: ${accountName}`);
      await this.editButtonForAccount(accountName).click();
      await this.dialog.waitFor({ state: 'visible' });
      Logger.info(
        `Successfully opened edit dialog for account: ${accountName}`
      );
    } catch (error) {
      Logger.error(`Failed to edit account: ${accountName}`, error as Error);
      throw new Error(
        `Failed to edit account ${accountName}: ${(error as Error).message}`
      );
    }
  }

  async getSuccessMessageText(): Promise<string | null> {
    const el = await this.page.$(this.selectors.messages.success);
    if (!el) return null;
    return (await el.textContent())?.trim() || null;
  }

  async searchAccounts(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
  }

  async getVisibleAccountNames(): Promise<string[]> {
    const rows = await this.accountRows.all();
    const names: string[] = [];
    for (const row of rows) {
      const name = await row.locator('td').first().textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }
}
