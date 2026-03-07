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

  async isOnAccountsPage(): Promise<boolean> {
    try {
      await this.addAccountButton.waitFor({ timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}
