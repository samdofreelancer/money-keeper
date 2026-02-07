import { Page, Locator } from '@playwright/test';

/**
 * Account Page Object - Best Practice Implementation
 * 
 * ✅ FOLLOWS BEST PRACTICES:
 * - Single responsibility: UI interactions only
 * - No assertions (no expect() calls)
 * - Consistent async API
 * - Encapsulated selectors (no getPage() leaking internals)
 * - DRY principle: selectors defined once
 * - Explicit waits: no arbitrary timeouts
 * 
 * ❌ DOES NOT:
 * - Assert anything
 * - Contain business logic
 * - Expose raw page object
 */
export class AccountPage {
  // ===== Selector Constants (DRY Principle) =====
  private readonly SELECTORS = {
    // Page structure
    pageTitle: '[data-testid="page-title"]',
    accountTable: '[data-testid="account-table"]',
    addAccountButton: '[data-testid="add-account-button"]',
    
    // Create dialog
    createDialog: '[data-testid="account-dialog"]',
    inputAccountName: '[data-testid="input-account-name"]',
    inputAccountBalance: '[data-testid="input-account-balance"] input',
    buttonCancel: '[data-testid="button-cancel"]',
    errorMessage: '[data-testid="error-message"]',
  };

  constructor(private page: Page) {}

  // ===== Navigation =====

  async navigateToAccounts() {
    await this.page.goto('/accounts');
    await this.page.waitForSelector(this.SELECTORS.accountTable, { timeout: 5000 });
  }

  // ===== Locators for Assertions (async getters, consistent API) =====

  async getPageHeading(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.pageTitle);
  }

  async getAccountTable(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.accountTable);
  }

  async getCreateAccountButton(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.addAccountButton);
  }

  async getCreateDialog(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.createDialog);
  }

  async getAccountNameInput(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.inputAccountName);
  }

  async getInitialBalanceInput(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.inputAccountBalance);
  }

  // ===== Create Account Dialog =====

  async openCreateAccountDialog() {
    await this.page.click(this.SELECTORS.addAccountButton);
    await this.page.waitForSelector(this.SELECTORS.createDialog, { timeout: 5000 });
  }

  async fillAccountName(name: string) {
    const input = this.page.locator(this.SELECTORS.inputAccountName);
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(name);
  }

  async fillInitialBalance(balance: number) {
    const input = this.page.locator(this.SELECTORS.inputAccountBalance);
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(balance.toString());
  }

  async closeDialog() {
    await this.page.click(this.SELECTORS.buttonCancel);
    await this.page.waitForSelector(this.SELECTORS.createDialog, { 
      state: 'hidden', 
      timeout: 5000 
    });
  }

  async getDialogErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator(this.SELECTORS.errorMessage);
    const isVisible = await errorElement.isVisible().catch(() => false);
    
    if (!isVisible) return null;
    return await errorElement.textContent();
  }
}

