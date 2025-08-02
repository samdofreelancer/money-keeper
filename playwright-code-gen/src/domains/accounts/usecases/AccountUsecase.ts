import { AccountsPage } from '../pages/AccountsPage';
import { expect } from '@playwright/test';

export class AccountUsecase {
  constructor(private accountsPage: AccountsPage) {}

  async createAccount({
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
    await this.accountsPage.clickAddAccount();
    await this.accountsPage.fillAccountForm({
      name,
      type,
      balance,
      currency,
      description
    });
    await this.accountsPage.clickCreate();
  }

  async verifyAccountExists(name: string) {
    const exists = await this.accountsPage.verifyAccountExists(name);
    expect(exists).toBeTruthy();
  }

  async verifyTotalBalance(expectedAmount: number) {
    const totalBalanceText = await this.accountsPage.getTotalBalance();
    expect(totalBalanceText).toContain(`$${expectedAmount.toLocaleString()}`);
  }
}