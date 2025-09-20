import { AccountsPlaywrightPage } from 'account-domains/pages/accounts.playwright.page';
import { CurrencyConfig } from 'shared/config/currency.config';
import { Inject, Transient, TOKENS } from 'shared/di';
import { Logger } from 'shared/utilities/logger';

/**
 * Use case for account balance operations via UI
 */
@Transient({ token: TOKENS.AccountBalanceUiUseCase })
export class AccountBalanceUiUseCase {
  constructor(
    @Inject(TOKENS.AccountsPlaywrightPage)
    private accountsPage: AccountsPlaywrightPage
  ) {}

  /**
   * Store the current total balance for later comparison
   */
  private initialTotalBalance: number = 0;

  /**
   * Get the current total balance as a number
   */
  private async getTotalBalanceAsNumber(): Promise<number> {
    const totalBalanceText = await this.accountsPage.getTotalBalance();

    // Use the currency parser utility for robust parsing
    const balance = CurrencyConfig.parseCurrency(totalBalanceText, 'en-US');

    if (balance === null) {
      throw new Error(
        `Could not extract balance from text: ${totalBalanceText}`
      );
    }

    return balance;
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
      throw new Error(
        `Current balance $${currentBalance} is less than expected amount $${expectedAmount}`
      );
    }

    // If we have an initial balance stored, verify the current balance is greater than or equal to it
    if (this.initialTotalBalance > 0) {
      if (currentBalance < this.initialTotalBalance) {
        throw new Error(
          `Current balance $${currentBalance} is less than initial balance $${this.initialTotalBalance}`
        );
      }
      Logger.info(
        `Balance check: Initial: $${this.initialTotalBalance}, Current: $${currentBalance}, Expected: $${expectedAmount}`
      );
    }
  }
}
