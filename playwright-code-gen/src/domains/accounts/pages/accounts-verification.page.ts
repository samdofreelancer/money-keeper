import { Page, Locator } from '@playwright/test';
import { selectors } from './accounts-selectors';
import { IAccountsVerification } from './accounts-interfaces';

export class AccountsVerification implements IAccountsVerification {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get addAccountButton(): Locator {
    return this.page.locator(selectors.buttons.addAccount);
  }

  private get successMessage(): Locator {
    return this.page.locator(selectors.messages.success);
  }

  async verifyAccountIsListed(name: string): Promise<boolean> {
    return await this.page.isVisible(`text=${name}`);
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.successMessage.waitFor({ timeout: 5000, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  async isErrorMessageVisible(errorMessage: string): Promise<boolean> {
    return await this.page.isVisible(`text=${errorMessage}`);
  }

  async verifyOnAccountsPage(): Promise<void> {
    await this.addAccountButton.waitFor({ timeout: 10000 });
  }

  async verifyAccountsSortedByBalance(
    balances: number[],
    order: 'asc' | 'desc'
  ): Promise<void> {
    const sortedBalances = [...balances].sort((a, b) =>
      order === 'asc' ? a - b : b - a
    );
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] !== sortedBalances[i]) {
        throw new Error(
          `Accounts are not sorted by balance in ${order}ending order. Expected ${JSON.stringify(
            sortedBalances
          )} but got ${JSON.stringify(balances)}.`
        );
      }
    }
  }
}
