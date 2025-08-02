import { expect } from '@playwright/test';
import { AccountsPage } from '../pages/AccountsPage';
import { Logger } from '@/shared/utilities/logger';

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
    // Store the initial balance before adding a new account
    await this.storeInitialBalance();
    Logger.info(`Initial total balance: $${this.initialTotalBalance}`);
    
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
   * Store the current total balance for later comparison
   */
  private initialTotalBalance: number = 0;

  /**
   * Get the current total balance as a number
   */
  private async getTotalBalanceAsNumber(): Promise<number> {
    const totalBalanceText = await this.accountsPage.getTotalBalance();
    // Extract the numeric value from the balance text (removing currency symbol and commas)
    const balanceMatch = totalBalanceText.match(/\$([\d,]+)/);
    if (!balanceMatch) throw new Error(`Could not extract balance from text: ${totalBalanceText}`);
    
    // Convert the string to a number, removing commas
    return parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  /**
   * Store the current balance for later comparison
   */
  async storeInitialBalance() {
    this.initialTotalBalance = await this.getTotalBalanceAsNumber();
  }

  /**
   * Verify that the total balance is greater than or equal to the expected amount
   */
  async verifyTotalBalance(expectedAmount: number) {
    const currentBalance = await this.getTotalBalanceAsNumber();
    
    // Verify the current balance is greater than or equal to the expected amount
    expect(currentBalance).toBeGreaterThanOrEqual(expectedAmount);
    
    // If we have an initial balance stored, verify the current balance is greater than or equal to it
    if (this.initialTotalBalance > 0) {
      expect(currentBalance).toBeGreaterThanOrEqual(this.initialTotalBalance);
      console.log(`Balance check: Initial: $${this.initialTotalBalance}, Current: $${currentBalance}, Expected: $${expectedAmount}`);
    }
  }
}