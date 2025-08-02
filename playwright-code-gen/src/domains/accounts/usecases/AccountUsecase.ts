import { AccountsPage } from '../pages/AccountsPage';
import { Logger } from '../../../shared/utilities/logger';
import { AccountData } from '../../../shared/types/account.types';

/**
 * Use case for account-related operations
 */
export class AccountUsecase {
  constructor(private accountsPage: AccountsPage) {}

  /**
   * Navigate to the accounts page
   */
  async navigateToAccountsPage() {
    await this.accountsPage.navigate();
  }

  /**
   * Click the Add Account button
   */
  async clickAddAccountButton() {
    await this.accountsPage.clickAddAccount();
  }

  /**
   * Click the Create button
   */
  async clickCreateButton() {
    await this.accountsPage.clickCreate();
  }

  /**
   * Fill the account form with the given details
   */
  async fillAccountForm(accountData: AccountData) {
    await this.accountsPage.fillAccountForm(accountData);
  }

  /**
   * Verify that an account was created successfully
   */
  async verifyAccountCreated(name: string) {
    const exists = await this.accountsPage.verifyAccountExists(name);
    if (!exists) {
      throw new Error(`Account ${name} was not found in the accounts list`);
    }
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
    if (currentBalance < expectedAmount) {
      throw new Error(`Current balance $${currentBalance} is less than expected amount $${expectedAmount}`);
    }
    
    // If we have an initial balance stored, verify the current balance is greater than or equal to it
    if (this.initialTotalBalance > 0) {
      if (currentBalance < this.initialTotalBalance) {
        throw new Error(`Current balance $${currentBalance} is less than initial balance $${this.initialTotalBalance}`);
      }
      console.log(`Balance check: Initial: $${this.initialTotalBalance}, Current: $${currentBalance}, Expected: $${expectedAmount}`);
    }
  }
}
