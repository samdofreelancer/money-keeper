import { Page, Locator } from '@playwright/test';
import { Logger } from 'shared/utilities/logger';
import { Inject, Transient, TOKENS } from 'shared/di';
import { BasePage } from 'shared/pages/base.page';
import { AccountFormComponent } from './components/account-form.component';

/**
 * Interface for navigation-related actions on the Accounts page
 */
export interface IAccountsNavigation {
  navigateToCategoriesPage(): Promise<void>;
  clickAccountsTab(): Promise<void>;
  navigateToAccountsPage(): Promise<void>;
}

/**
 * Interface for account-related actions on the Accounts page
 */
export interface IAccountsActions {
  clickAddAccountButton(): Promise<void>;
  deleteAccount(accountName: string): Promise<void>;
  clickEditAccount(accountName: string): Promise<void>;
  searchAccounts(query: string): Promise<void>;
  reload(): Promise<void>;
}

/**
 * Interface for verification methods on the Accounts page
 */
export interface IAccountsVerification {
  verifyAccountIsListed(name: string): Promise<boolean>;
  isSuccessMessageVisible(): Promise<boolean>;
  isErrorMessageVisible(errorMessage: string): Promise<boolean>;
  verifyOnAccountsPage(): Promise<void>;
}

/**
 * Interface for data retrieval methods on the Accounts page
 */
export interface IAccountsDataRetrieval {
  getTotalBalance(): Promise<string>;
  getAccountCount(accountName: string): Promise<number>;
  getTotalAccountCount(): Promise<number>;
  getAccountDescription(accountName: string): Promise<string>;
  getAccountBalanceForRow(accountName: string): Promise<string | null>;
  getSuccessMessageText(): Promise<string | null>;
  getVisibleAccountNames(): Promise<string[]>;
}

/**
 * Page object for the Accounts page
 */
@Transient({ token: TOKENS.AccountsPlaywrightPage })
export class AccountsPlaywrightPage
  extends BasePage
  implements
    IAccountsNavigation,
    IAccountsActions,
    IAccountsVerification,
    IAccountsDataRetrieval
{
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

  // IAccountsNavigation implementation
  async navigateToCategoriesPage() {
    await this.page.goto(this.selectors.navigation.categoriesPage);
  }

  async clickAccountsTab() {
    await this.accountsTab.click();
  }

  async navigateToAccountsPage() {
    await this.page.goto(this.selectors.navigation.accountsPage);
  }

  // IAccountsActions implementation
  async clickAddAccountButton() {
    await this.addAccountButton.click();
    await this.dialog.waitFor({ state: 'visible' });
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

  async searchAccounts(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
  }

  async reload() {
    await this.page.reload();
  }

  // IAccountsVerification implementation
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

  async verifyOnAccountsPage(): Promise<void> {
    await this.addAccountButton.waitFor({ timeout: 10000 });
  }

  // IAccountsDataRetrieval implementation
  async getTotalBalance(): Promise<string> {
    const balance = await this.page.textContent(
      'text=Total Balance of Active Accounts:'
    );
    if (!balance) throw new Error('Total balance element not found');
    return balance;
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

  async getSuccessMessageText(): Promise<string | null> {
    const el = await this.page.$(this.selectors.messages.success);
    if (!el) return null;
    return (await el.textContent())?.trim() || null;
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
