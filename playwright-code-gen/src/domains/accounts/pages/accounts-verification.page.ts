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
    try {
      // Wait for and check el-message error
      await this.page.waitForSelector(`${selectors.messages.error}`, {
        state: 'visible',
        timeout: 5000,
      });
      const toastError = await this.page.isVisible(
        `${selectors.messages.error}:has-text("${errorMessage}")`
      );

      if (toastError) {
        return true;
      }

      // Check form validation error (if toast not found)
      const formError = await this.page.isVisible(`text=${errorMessage}`);
      return formError;
    } catch {
      // If timeout occurs while waiting for error message
      return false;
    }
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
