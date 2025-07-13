// e2e/src/domains/account/infrastructure/pages/create-account.playwright.page.ts

import { Page } from '@playwright/test';
import { CreateAccountUiPort } from '../../domain/ports/ui/create-account-ui.port';

export class CreateAccountPlaywrightPage implements CreateAccountUiPort {
  constructor(private readonly page: Page) {}

  async navigateToApp(): Promise<void> {
    await this.page.goto('http://localhost:3000'); // Adjust URL as needed
  }

  async fillAccountForm(data: {
    accountName: string;
    accountType: string;
    initialBalance: number;
    currency: string;
    description?: string;
  }): Promise<void> {
    await this.page.click('button:has-text("Add Account")');
    await this.page.fill('input[name="accountName"]', data.accountName);
    await this.page.selectOption('select[name="accountType"]', data.accountType);
    await this.page.fill('input[name="initialBalance"]', data.initialBalance.toString());
    await this.page.selectOption('select[name="currency"]', data.currency);
    if (data.description) {
      await this.page.fill('textarea[name="description"]', data.description);
    }
  }

  async submitForm(): Promise<void> {
    await this.page.click('button:has-text("Submit")');
  }

  async isAccountListed(accountName: string, balance: string): Promise<boolean> {
    const accountRow = await this.page.locator(`text=${accountName}`).first();
    if (!await accountRow.count()) {
      return false;
    }
    const balanceText = await this.page.locator(`tr:has-text("${accountName}") >> text=${balance}`).count();
    return balanceText > 0;
  }
}
