import { expect } from '@playwright/test';
import { AccountsPage } from '../pages/AccountsPage';

/**
 * Steps for account-related operations
 */
export class AccountSteps {
  constructor(private accountsPage: AccountsPage) {}

  /**
   * Navigate to the accounts page
   */
  async navigateToAccountsPage() {
    await this.accountsPage.navigate();
  }

  /**
   * Create a new account with the given details
   */
  async createNewAccount({
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

  /**
   * Verify that an account was created successfully
   */
  async verifyAccountCreated(name: string) {
    const exists = await this.accountsPage.verifyAccountExists(name);
    expect(exists).toBeTruthy();
  }

  /**
   * Verify that the total balance includes the new account balance
   */
  async verifyTotalBalance(expectedAmount: number) {
    const totalBalanceText = await this.accountsPage.getTotalBalance();
    expect(totalBalanceText).toContain(`$${expectedAmount.toLocaleString()}`);
  }
}