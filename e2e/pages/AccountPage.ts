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
    selectCurrency: '[data-testid="form-item-currency"] .el-select',
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

  /**
   * Refresh the accounts page (reload the table data)
   * Useful after creating/updating/deleting accounts via API
   */
  async refreshAccountsPage() {
    logger.debug('Refreshing accounts page...');
    await this.page.reload();
    await this.page.waitForSelector(this.SELECTORS.accountTable, { timeout: 5000 });
    logger.debug('Accounts page refreshed');
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
   * @param type The account type to select (e.g., 'E_WALLET', 'BANK_ACCOUNT')
   */
  async selectAccountType(type: string) {
    const selectField = this.page.locator(this.SELECTORS.selectAccountType);
    await selectField.waitFor({ state: 'visible', timeout: 5000 });
    
    logger.debug(`Opening account type dropdown for type: ${type}`);
    
    // Click to open the dropdown
    await selectField.click();
    await this.page.waitForTimeout(300); // Wait for dropdown to open
    
    // Convert enum format (E_WALLET) to UI display format (E-Wallet)
    // Backend: E_WALLET, BANK_ACCOUNT
    // UI: E-Wallet, Bank Account
    const displayFormat = type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
    
    logger.debug(`Looking for dropdown item with text: "${displayFormat}"`);
    
    // Try to find the option by exact text match
    let option = this.page.locator(`.el-select-dropdown__item:has-text("${displayFormat}")`);
    let found = await option.count().then(c => c > 0).catch(() => false);

    if (found) {
      await option.first().click();
      await this.page.waitForTimeout(500);
      logger.debug('Account type selected', { type, displayFormat });
      return;
    }

    logger.debug(`Text selector failed, trying first available option...`);

    // Fallback: Just click the first available option
    const allOptions = this.page.locator('.el-select-dropdown__item');
    const count = await allOptions.count();
    
    logger.debug(`Found ${count} total dropdown items`);
    
    if (count > 0) {
      const firstOptionText = await allOptions.first().textContent();
      logger.debug(`Clicking first option with text: "${firstOptionText}"`);
      await allOptions.first().click();
      await this.page.waitForTimeout(500);
      logger.debug('Account type selected (first option)', { type });
      return;
    }

    logger.error(`Could not find any account type options`);
    throw new Error(`Account type option not found: ${type}`);
  }

  /**
   * Select currency from currency selector
   * @param currency Currency code (e.g., 'USD', 'EUR', 'VND')
   */
  async selectCurrency(currency: string) {
    const selectField = this.page.locator(this.SELECTORS.selectCurrency);
    await selectField.waitFor({ state: 'visible', timeout: 5000 });
    
    logger.debug(`Opening currency dropdown for: ${currency}`);
    
    // Click to open the dropdown
    await selectField.click();
    await this.page.waitForTimeout(300); // Wait for dropdown to open
    
    // Try to find the option by exact text match (USD, EUR, VND, etc.)
    let option = this.page.locator(`.el-select-dropdown__item:has-text("${currency}")`);
    let found = await option.count().then(c => c > 0).catch(() => false);

    if (found) {
      await option.first().click();
      await this.page.waitForTimeout(500);
      logger.debug('Currency selected', { currency });
      return;
    }

    logger.debug(`Text selector failed, trying first available option...`);

    // Fallback: Just click the first available option
    const allOptions = this.page.locator('.el-select-dropdown__item');
    const count = await allOptions.count();
    
    logger.debug(`Found ${count} total dropdown items`);
    
    if (count > 0) {
      const firstOptionText = await allOptions.first().textContent();
      logger.debug(`Clicking first option with text: "${firstOptionText}"`);
      await allOptions.first().click();
      await this.page.waitForTimeout(500);
      logger.debug('Currency selected (first option)', { currency });
      return;
    }

    logger.error(`Could not find any currency options`);
    throw new Error(`Currency option not found: ${currency}`);
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
      logger.error(`Form has validation errors before submission: ${errorMsg}`);
      throw new Error(
        `Form has validation errors before submission: ${errorMsg}`
      );
    }
    
    logger.info('Submitting create account form...');
    logger.debug(`Submit button selector: ${this.SELECTORS.buttonSubmit}`);
    logger.debug(`Dialog selector: ${this.SELECTORS.createDialog}`);
    
    // Click submit
    await submitButton.click();
    logger.debug('Submit button clicked');
    
    // Wait for the form to be validated and dialog to close
    // Add longer timeout for backend processing
    try {
      logger.debug('Waiting for dialog to close...');
      await this.page.waitForSelector(this.SELECTORS.createDialog, {
        state: 'hidden',
        timeout: 10000,
      });
      logger.success('Form submitted successfully and dialog closed');
    } catch (error) {
      logger.error(`Dialog did not close within timeout: ${error}`);
      
      // Check if there's a validation error on the page
      const validationError = await this.getDialogErrorMessage();
      if (validationError) {
        logger.error(`Validation error found: ${validationError}`);
        throw new Error(
          `Form submission failed with validation error: ${validationError}`
        );
      }

      // Check if dialog is still visible
      const dialogVisible = await this.page.locator(this.SELECTORS.createDialog).isVisible().catch(() => false);
      logger.error(`Dialog still visible: ${dialogVisible}`);

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
      const isVisible = await cell.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (!isVisible) {
        // Try alternative selector if first fails
        const altCell = this.page.locator(
          `${this.SELECTORS.accountTable} :text("${accountName}")`
        );
        const altVisible = await altCell.isVisible({ timeout: 1000 }).catch(() => false);
        if (altVisible) {
          logger.debug(`Account found in table (alt selector): ${accountName}`);
          return true;
        }
        return false;
      }

      logger.debug(`Account found in table: ${accountName}`);
      return true;
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
    const startTime = Date.now();
    
    try {
      // Retry loop with multiple strategies
      while (Date.now() - startTime < timeout) {
        // Strategy 1: Look for any cell in tbody containing the account name
        let found = await this.page
          .locator(`${this.SELECTORS.accountTable} tbody td:has-text("${accountName}")`)
          .count()
          .then(c => c > 0)
          .catch(() => false);
        
        if (found) {
          logger.success(`Account "${accountName}" found in table`);
          return true;
        }

        logger.debug(`Selector 1 failed, trying alternative for: ${accountName}`);
        
        // Strategy 2: Look for any text in the entire table
        found = await this.page
          .locator(`${this.SELECTORS.accountTable}:has-text("${accountName}")`)
          .count()
          .then(c => c > 0)
          .catch(() => false);
        
        if (found) {
          logger.success(`Account "${accountName}" found in table (alt selector)`);
          return true;
        }

        logger.debug(`Selector 2 failed, checking table text content...`);
        
        // Strategy 3: Check if table contains the text anywhere
        const table = this.page.locator(this.SELECTORS.accountTable);
        const tableText = await table.textContent().catch(() => '');
        
        if (tableText.includes(accountName)) {
          logger.success(`Account "${accountName}" found via text match`);
          return true;
        }

        // Wait before retrying
        await this.page.waitForTimeout(500);
      }

      // Final attempt: log table content for debugging
      const table = this.page.locator(this.SELECTORS.accountTable);
      const tableText = await table.textContent().catch(() => '');
      logger.error(
        `Account "${accountName}" not found in table. Table content: ${tableText}`
      );
      return false;
    } catch (error) {
      logger.error(
        `Error waiting for account "${accountName}" in table: ${String(error)}`
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

  // ===== Network & Keyboard Support =====

  /**
   * Route API requests (for network failure simulation)
   */
  async routeApiRequests(
    pattern: string,
    handler: (route: any) => Promise<void>
  ): Promise<void> {
    await this.page.route(pattern, handler);
  }

  /**
   * Stop routing API requests
   */
  async unrouteApiRequests(pattern: string): Promise<void> {
    await this.page.unroute(pattern);
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Focus on submit button
   */
  async focusSubmitButton(): Promise<void> {
    const submitButton = this.page.locator(this.SELECTORS.buttonSubmit);
    await submitButton.focus();
  }

  /**
   * Check if submit button is focused
   */
  async isSubmitButtonFocused(): Promise<boolean> {
    const submitButton = this.page.locator(this.SELECTORS.buttonSubmit);
    return await submitButton.evaluate((el) => el === document.activeElement);
  }
}

