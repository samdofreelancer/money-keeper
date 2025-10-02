import { Page, Locator } from '@playwright/test';
import { selectors } from './accounts-selectors';
import { IAccountsDataRetrieval } from './accounts-interfaces';

export class AccountsDataRetrieval implements IAccountsDataRetrieval {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get accountRows(): Locator {
    return this.page.locator(selectors.accountElements.accountRow);
  }

  private accountRowByName(accountName: string): Locator {
    return this.page.locator(`text=${accountName}`);
  }

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
    const descriptionSelector = `text=${accountName} >> .. >> ${selectors.accountElements.accountDescription}`;
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
    const el = await this.page.$(selectors.messages.success);
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
