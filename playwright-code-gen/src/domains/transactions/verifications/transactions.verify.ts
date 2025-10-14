import { expect } from '@playwright/test';
import { TransactionsPage } from '../pages/transactions.playwright.page';
import { TOKENS } from 'shared/di/tokens';
import { Inject, Transient } from 'shared/di/decorators';

@Transient({ token: TOKENS.TransactionsVerification })
export class TransactionsVerification {
  constructor(
    @Inject(TOKENS.TransactionsPage)
    private readonly transactionsPage: TransactionsPage
  ) {}

  async verifyTransactionExists(description: string): Promise<void> {
    const exists = await this.transactionsPage.verifyTransactionExists(description);
    expect(exists).toBe(true);
  }

  async verifyTransactionDoesNotExist(description: string): Promise<void> {
    const exists = await this.transactionsPage.verifyTransactionExists(description);
    expect(exists).toBe(false);
  }

  async verifyTransactionDetails(description: string, expectedDetails: Record<string, string>): Promise<void> {
    for (const [key, expectedValue] of Object.entries(expectedDetails)) {
      const actualValue = await this.transactionsPage.getTransactionDetail(description, key);
      expect(actualValue).toBe(expectedValue);
    }
  }

  async verifyTransactionAmount(description: string, expectedAmount: string): Promise<void> {
    const actualAmount = await this.transactionsPage.getTransactionDetail(description, 'amount');
    expect(actualAmount).toBe(expectedAmount);
  }
}
