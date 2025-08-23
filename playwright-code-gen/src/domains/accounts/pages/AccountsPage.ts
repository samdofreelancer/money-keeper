import { Page } from '@playwright/test';
import { BasePage } from '../../../shared/pages/base.page';
import { Logger } from '../../../shared/utilities/logger';

export class AccountsPage extends BasePage {
  // Selectors
  private readonly accountsTabSelector = '[data-testid="accounts-tab"]';
  private readonly addAccountButtonSelector = '[data-testid="add-account-button"]';
  private readonly accountNameInputSelector = '[data-testid="account-name-input"]';
  private readonly accountTypeInputSelector = '[data-testid="account-type-input"]';
  private readonly accountBalanceInputSelector = '[data-testid="account-balance-input"]';
  private readonly accountCurrencyInputSelector = '[data-testid="account-currency-input"]';
  private readonly accountDescriptionInputSelector = '[data-testid="account-description-input"]';
  private readonly createButtonSelector = '[data-testid="create-account-button"]';
  private readonly accountListSelector = '[data-testid="accounts-list"]';
  private readonly accountItemSelector = '[data-testid="account-item"]';
  private readonly accountBalanceSelector = '[data-testid="account-balance"]';
  private readonly errorMessageSelector = '[data-testid="error-message"]';

  constructor(page: Page) {
    super(page);
  }

  async navigateToAccountsPage() {
    await this.page.goto('/accounts');
  }

  async clickAccountsTab() {
    await this.page.click(this.accountsTabSelector);
  }

  async clickAddAccount() {
    await this.page.click(this.addAccountButtonSelector);
  }

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
    await this.page.fill(this.accountNameInputSelector, name);
    await this.page.selectOption(this.accountTypeInputSelector, type);
    await this.page.fill(this.accountBalanceInputSelector, balance.toString());
    await this.page.selectOption(this.accountCurrencyInputSelector, currency);
    await this.page.fill(this.accountDescriptionInputSelector, description);
  }

  async clickCreate() {
    await this.page.click(this.createButtonSelector);
  }

  async verifyAccountIsListed(accountName: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.accountListSelector);
      const accountElement = await this.page.locator(`${this.accountItemSelector}:has-text("${accountName}")`);
      return await accountElement.isVisible();
    } catch (error) {
      Logger.error(`Error verifying account existence: ${error}`);
      return false;
    }
  }

  async getTotalBalance(): Promise<string> {
    await this.page.waitForSelector(this.accountBalanceSelector);
    return await this.page.locator(this.accountBalanceSelector).innerText();
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    try {
      // Wait for any error message to appear
      await this.page.waitForSelector(this.errorMessageSelector, { timeout: 5000 });
      
      // Check if the specific error message is present
      const errorElement = await this.page.locator(`${this.errorMessageSelector}:has-text("${message}")`);
      return await errorElement.isVisible();
    } catch (error) {
      Logger.error(`Error checking error message: ${error}`);
      return false;
    }
  }

  async getAccountCount(accountName: string): Promise<number> {
    const elements = await this.page.locator(`${this.accountItemSelector}:has-text("${accountName}")`).all();
    return elements.length;
  }

  async getTotalAccountCount(): Promise<number> {
    const elements = await this.page.locator(this.accountItemSelector).all();
    return elements.length;
  }

  async getAccountDescription(accountName: string): Promise<string> {
    const descriptionElement = await this.page.locator(`${this.accountItemSelector}:has-text("${accountName}") [data-testid="account-description"]`);
    return await descriptionElement.innerText();
  }
}
