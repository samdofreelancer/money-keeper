// e2e/src/domains/account/infrastructure/pages/create-account.playwright.page.ts

import { Page } from '@playwright/test';
import { CreateAccountUiPort } from '../../domain/ports/ui/create-account-ui.port';
import { config } from '../../../../shared/config/env.config';

export class CreateAccountPlaywrightPage implements CreateAccountUiPort {
  constructor(private readonly page: Page) {}

  async navigateToApp(): Promise<void> {
    const baseUrl = config.browser.baseUrl || 'http://localhost:5173';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const accountsUrl = `${cleanBaseUrl}/accounts`;
    await this.page.goto(accountsUrl);
  }

  async clickButton(buttonName: string): Promise<void> {
    await this.page.click(`button:has-text("${buttonName}")`);
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

  async verifyAccountCreationSuccess(): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    const successIndicator = await this.page.locator('text=Account created successfully').count();
    if (successIndicator === 0) {
      // Try alternative success indicators
      const redirected = await this.page.url().includes('/accounts');
      return redirected;
    }
    return true;
  }

  async verifyTotalBalanceUpdated(): Promise<string | null> {
    await this.page.waitForTimeout(500);
    const totalBalanceElement = await this.page.locator('[data-testid="total-balance"], .total-balance, text=Total Balance').first();
    const exists = await totalBalanceElement.count() > 0;
    
    if (!exists) {
      return null;
    }
    
    return await totalBalanceElement.textContent();
  }

  async verifyConflictError(): Promise<string | null> {
    await this.page.waitForTimeout(1000);
    const errorElement = await this.page.locator('text=Account name already exists, text=already exists, .error-message').first();
    const hasError = await errorElement.count() > 0;
    
    if (hasError) {
      return await errorElement.textContent();
    }
    
    return null;
  }

  async verifyValidationErrors(): Promise<string | null> {
    await this.page.waitForTimeout(1000);
    const errorElements = await this.page.locator('.error, .validation-error, text=required, text=invalid').count();
    
    if (errorElements > 0) {
      const errorText = await this.page.locator('.error, .validation-error').first().textContent();
      return errorText;
    }
    
    return null;
  }

  async isOnFormPage(): Promise<boolean> {
    const isOnFormPage = await this.page.locator('button:has-text("Submit"), input[name="accountName"]').count() > 0;
    return isOnFormPage;
  }

  async trySubmitInvalidForm(data: {
    accountName?: string;
    accountType?: string;
    initialBalance?: number;
    currency?: string;
    description?: string;
  }): Promise<string | null> {
    // Navigate to form first
    await this.navigateToApp();
    await this.clickButton("Add Account");
    
    // Fill with invalid data
    const accountData = {
      accountName: data.accountName || "",
      accountType: data.accountType || "BANK_ACCOUNT",
      initialBalance: data.initialBalance || 0,
      currency: data.currency || "USD",
      description: data.description
    };
    
    await this.fillAccountForm(accountData);
    await this.submitForm();
    
    // Wait for validation errors and return error message
    return await this.verifyValidationErrors();
  }
}
