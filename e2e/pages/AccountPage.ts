import { Page } from '@playwright/test';

/**
 * Account Page Object
 * 
 * Encapsulates all UI interactions for the account management page.
 * Contains ONLY:
 * - Selectors and locators
 * - Low-level UI actions (click, fill, etc.)
 * 
 * Does NOT contain:
 * - Assertions
 * - Business logic
 * - Conditional logic
 */
export class AccountPage {
  constructor(private page: Page) {}

  // ===== Public Access =====
  
  getPage(): Page {
    return this.page;
  }

  // ===== Navigation & Page State =====

  async navigateToAccounts() {
    await this.page.goto('/accounts');
    await this.page.waitForSelector('[data-testid="account-table"]', { timeout: 5000 });
  }

  async isAccountTableVisible() {
    return await this.page.isVisible('[data-testid="account-table"]');
  }

  // ===== Create Account Dialog =====

  async openCreateAccountDialog() {
    await this.page.click('[data-testid="add-account-button"]');
    await this.page.waitForSelector('[data-testid="account-dialog"]', { timeout: 5000 });
  }

  async fillAccountName(name: string) {
    await this.page.fill('[data-testid="input-account-name"]', name);
  }

  async fillInitialBalance(balance: number) {
    // el-input-number wraps the actual input, so we need to find the input inside
    const input = this.page.locator('[data-testid="input-account-balance"] input');
    await input.fill(balance.toString());
  }

  async getDialogErrorMessage() {
    const errorElement = await this.page.$('[data-testid="error-message"]');
    if (!errorElement) return null;
    return await this.page.textContent('[data-testid="error-message"]');
  }

  async closeDialog() {
    await this.page.click('[data-testid="button-cancel"]');
    await this.page.waitForSelector('[data-testid="account-dialog"]', { state: 'hidden', timeout: 5000 });
  }
}

