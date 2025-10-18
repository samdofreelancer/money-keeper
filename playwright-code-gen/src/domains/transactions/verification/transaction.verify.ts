import { Page, expect } from '@playwright/test';
import { TransactionsPage } from '../pages/transactions.playwright.page';

export class TransactionVerify {
  constructor(private readonly page: Page, private readonly transactionsPage: TransactionsPage) {}

  async shouldSeeTransaction(description: string) {
    // reload handled by steps when needed; just delegate existence check
    const exists = await this.transactionsPage.verifyTransactionExists(description);
    expect(exists).toBe(true);
  }

  async shouldNotSeeTransaction(description: string) {
    const exists = await this.transactionsPage.verifyTransactionExists(description);
    expect(exists).toBe(false);
  }

  async shouldHaveTransactionDetail(description: string, key: string, expectedValue: string) {
    const actualValue = await this.transactionsPage.getTransactionDetail(description, key);
    expect(actualValue).toBe(expectedValue);
  }

  async shouldHaveTransactionAmount(description: string, expectedAmount: string) {
    const actualAmount = await this.transactionsPage.getTransactionDetail(description, 'amount');
    expect(actualAmount).toBe(expectedAmount);
  }
}
