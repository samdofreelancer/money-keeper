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
    // Improved: check both toast-style messages and inline form errors concurrently
    // to avoid flakiness where one appears quickly and the other never does.
    const toastLocator = this.page.locator(
      `${selectors.messages.error}:has-text("${errorMessage}")`
    );
    const inlineLocator = this.page.locator(`text=${errorMessage}`);

    // Wait up to timeoutMs for either locator to become visible.
    const timeoutMs = 5000;

    try {
      const start = Date.now();

      // Poll both locators until timeout — this avoids awaiting one then the other
      // which can miss fast transient messages.
      while (Date.now() - start < timeoutMs) {
        if (await toastLocator.isVisible()) return true;
        if (await inlineLocator.isVisible()) return true;
        // small backoff to avoid tight loop
        await this.page.waitForTimeout(100);
      }

      return false;
    } catch {
      return false;
    }
  }

  async verifyOnAccountsPage(): Promise<void> {
    await this.addAccountButton.waitFor({ timeout: 10000 });
  }
}
