import { AccountsPage } from '../pages/AccountsPage';
import { AccountUsecase } from '../usecases/AccountUsecase';

/**
 * Steps for account-related operations
 */
export class AccountSteps {
  private accountUsecase: AccountUsecase;

  constructor(private accountsPage: AccountsPage) {
    this.accountUsecase = new AccountUsecase(accountsPage);
  }

  /**
   * Navigate to the accounts page
   */
  async navigateToAccountsPage() {
    await this.accountUsecase.navigateToAccountsPage();
  }

  /**
   * Create a new account with the given details
   */
  async createNewAccount(accountData: {
    name: string;
    type: string;
    balance: number;
    currency: string;
    description: string;
  }) {
    await this.accountUsecase.createNewAccount(accountData);
  }

  /**
   * Verify that an account was created successfully
   */
  async verifyAccountCreated(name: string) {
    await this.accountUsecase.verifyAccountCreated(name);
  }

  /**
   * Store the current balance for later comparison
   */
  async storeInitialBalance() {
    await this.accountUsecase.storeInitialBalance();
  }

  /**
   * Verify that the total balance is greater than or equal to the expected amount
   */
  async verifyTotalBalance(expectedAmount: number) {
    await this.accountUsecase.verifyTotalBalance(expectedAmount);
  }
}
