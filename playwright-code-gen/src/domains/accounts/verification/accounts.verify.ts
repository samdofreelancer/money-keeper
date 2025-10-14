import { expect } from '@playwright/test';
import { AccountsPlaywrightPage } from '../pages/accounts.playwright.page';
import { TOKENS } from 'shared/di/tokens';
import { Inject, Transient } from 'shared/di/decorators';

@Transient({ token: TOKENS.AccountsVerification })
export class AccountsVerification {
  constructor(
    @Inject(TOKENS.AccountsPlaywrightPage)
    private readonly accountsPage: AccountsPlaywrightPage
  ) {}

  async verifySuccessMessageVisible(): Promise<void> {
    expect(await this.accountsPage.isSuccessMessageVisible()).toBe(true);
  }

  async verifyErrorMessageVisible(errorMessage: string): Promise<void> {
    expect(await this.accountsPage.isErrorMessageVisible(errorMessage)).toBe(true);
  }

  async verifySuccessMessageText(expectedMessage: string): Promise<void> {
    expect(await this.accountsPage.getSuccessMessageText()).toBe(expectedMessage);
  }

  async verifyAccountBalance(accountName: string, expectedBalance: string): Promise<void> {
    const actualBalance = await this.accountsPage.getAccountBalanceForRow(accountName);
    expect(actualBalance).toBe(expectedBalance);
  }

  async verifyAccountListed(accountName: string): Promise<void> {
    const exists = await this.accountsPage.verifyAccountIsListed(accountName);
    expect(exists).toBe(true);
  }

  async verifyAccountNotListed(accountName: string): Promise<void> {
    const exists = await this.accountsPage.verifyAccountIsListed(accountName);
    expect(exists).toBe(false);
  }

  async verifySearchResultsContain(expectedAccountName: string): Promise<void> {
    const visibleNames = await this.accountsPage.getVisibleAccountNames();
    for (const name of visibleNames) {
      expect(name).toContain(expectedAccountName);
    }
  }

  async verifyAccountsSortedByBalance(order: 'ascending' | 'descending'): Promise<void> {
    const balances = await this.accountsPage.getAccountBalances();
    const sortedBalances = [...balances].sort((a, b) =>
      order === 'ascending' ? a - b : b - a
    );
    for (let i = 0; i < balances.length; i++) {
      expect(balances[i]).toBe(sortedBalances[i]);
    }
  }

  async verifyAccountCount(accountName: string, expectedCount: number): Promise<void> {
    const count = await this.accountsPage.getAccountCount(accountName);
    expect(count).toBe(expectedCount);
  }

  async verifyAccountNotCreated(): Promise<void> {
    const accountCount = await this.accountsPage.getTotalAccountCount();
    if (accountCount > 0) {
      throw new Error('An account was created when it should not have been');
    }
  }

  async verifyBalanceInCurrency(currency: string): Promise<void> {
    const balanceText = await this.accountsPage.getTotalBalance();
    if (!balanceText.includes(currency)) {
      throw new Error(`Balance does not display in ${currency}`);
    }
  }

  async verifyAccountDescription(accountName: string, expectedDescription: string): Promise<void> {
    const description = await this.accountsPage.getAccountDescription(accountName);
    if (description !== expectedDescription) {
      throw new Error(`Expected description "${expectedDescription}", but found "${description}"`);
    }
  }

  async verifyTotalBalanceHasCurrency(): Promise<void> {
    const totalBalance = await this.accountsPage.getTotalBalance();
    const symbols = ['₫', '$', '€'];
    expect(symbols.some(s => totalBalance.includes(s))).toBe(true);
  }
}
