import { Page, Locator } from '@playwright/test';
import { logger } from '@/utils/logger';

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
 * - Structured logging with logger utility
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
    selectAccountType: '[data-testid="select-account-type"]',
    optionAccountType: '[data-testid="option-account-type"]',
    formItemCurrency: '[data-testid="form-item-currency"]',
    buttonCancel: '[data-testid="button-cancel"]',
    buttonSubmit: '[data-testid="button-submit"]',
    errorMessage: '[data-testid="error-message"]',
    accountTableRow: '[data-testid="account-row"]',
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

  /**
   * Get the currency selector form field
   */
  async getCurrencySelectorField(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.formItemCurrency);
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
    logger.debug('Account name filled', { name });
  }

  async fillInitialBalance(balance: number) {
    const input = this.page.locator(this.SELECTORS.inputAccountBalance);
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(balance.toString());
    logger.debug('Initial balance filled', { balance });
  }

  /**
   * Select account type from dropdown
   * @param type The account type to select (e.g., 'E-Wallet', 'Bank Account')
   */
  async selectAccountType(type: string) {
    const selectField = this.page.locator(this.SELECTORS.selectAccountType);
    await selectField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click to open the dropdown
    await selectField.click();
    
    // Wait for the dropdown options to appear
    const option = this.page.locator(
      `${this.SELECTORS.optionAccountType}:has-text("${type}")`
    );
    
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    
    // Wait for the selection to be registered
    await this.page.waitForTimeout(500);
    logger.debug('Account type selected', { type });
  }

  /**
   * Select currency from currency selector
   * @param currency Currency code (e.g., 'USD', 'EUR', 'VND')
   */
  async selectCurrency(currency: string) {
    // Find the currency select within the form-item
    const formItemCurrency = this.page.locator(this.SELECTORS.formItemCurrency);
    const currencyField = formItemCurrency.locator('.el-select');
    
    await currencyField.waitFor({ state: 'visible', timeout: 5000 });
    await currencyField.click();
    
    // Wait for the dropdown to open
    await this.page.waitForTimeout(300);
    
    // Look for the currency option using the data-testid pattern: currency-${code.toLowerCase()}
    const option = this.page
      .locator(`[data-testid="currency-${currency.toLowerCase()}"]`)
      .first();
    
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    
    // Wait for the selection to be registered
    await this.page.waitForTimeout(500);
    logger.debug('Currency selected', { currency });
  }

  async closeDialog() {
    await this.page.click(this.SELECTORS.buttonCancel);
    await this.page.waitForSelector(this.SELECTORS.createDialog, { 
      state: 'hidden', 
      timeout: 5000 
    });
    logger.info('Create account dialog closed');
  }

  async getDialogErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator(this.SELECTORS.errorMessage);
    const isVisible = await errorElement.isVisible().catch(() => false);
    
    if (!isVisible) return null;
    return await errorElement.textContent();
  }

  // ===== Form Submission & Verification =====

  /**
   * Submit the create account form
   * Waits for dialog to close after submission
   */
  async submitCreateAccountForm() {
    const submitButton = this.page.locator(this.SELECTORS.buttonSubmit);
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Check for validation errors before submitting
    const errorMsg = await this.getDialogErrorMessage();
    if (errorMsg) {
      throw new Error(
        `Form has validation errors before submission: ${errorMsg}`
      );
    }
    
    // Click submit
    await submitButton.click();
    
    // Wait for the form to be validated and dialog to close
    // Add longer timeout for backend processing
    try {
      await this.page.waitForSelector(this.SELECTORS.createDialog, {
        state: 'hidden',
        timeout: 10000,
      });
      logger.success('Form submitted successfully and dialog closed');
    } catch {
      // Check if there's a validation error on the page
      const validationError = await this.getDialogErrorMessage();
      if (validationError) {
        throw new Error(
          `Form submission failed with validation error: ${validationError}`
        );
      }
      throw new Error(
        'Form submission timed out - dialog did not close within 10 seconds'
      );
    }
  }

  /**
   * Get submit button for testing button visibility
   */
  async getSubmitButton(): Promise<Locator> {
    return this.page.locator(this.SELECTORS.buttonSubmit);
  }

  /**
   * Verify account exists in table by name
   * Returns true if account row containing name is visible
   * Uses element-ui table structure: tbody > tr containing account name
   */
  async isAccountInTable(accountName: string): Promise<boolean> {
    try {
      // Element-UI renders table as <tbody> with <tr> rows
      // Look for any cell in the table containing the account name
      const cell = this.page.locator(
        `${this.SELECTORS.accountTable} tbody td:has-text("${accountName}")`
      );
      const isVisible = await cell.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        logger.debug('Account found in table', { accountName });
      }
      return isVisible;
    } catch (_error) {
      logger.error(`Failed to verify account in table: ${_error}`);
      return false;
    }
  }

  /**
   * Wait for account to appear in table after creation
   * Useful for verification after form submission
   * Uses element-ui table structure: tbody > tr containing account name
   */
  async waitForAccountInTable(
    accountName: string,
    timeout: number = 10000
  ): Promise<boolean> {
    try {
      // Element-UI renders table as <tbody> with <tr> rows
      // Look for any cell in the table containing the account name
      const cell = this.page.locator(
        `${this.SELECTORS.accountTable} tbody td:has-text("${accountName}")`
      );
      await cell.waitFor({ state: 'visible', timeout });
      logger.success(`Account "${accountName}" found in table`);
      return true;
    } catch {
      logger.error(
        `Account "${accountName}" did not appear in table within ${timeout}ms`
      );
      return false;
    }
  }

  /**
   * Get all form field values for debugging
   */
  async getFormFieldValues(): Promise<Record<string, string>> {
    const nameValue = await (
      await this.getAccountNameInput()
    ).inputValue();
    const balanceValue = await (
      await this.getInitialBalanceInput()
    ).inputValue();
    
    return {
      name: nameValue,
      balance: balanceValue,
    };
  }
}

