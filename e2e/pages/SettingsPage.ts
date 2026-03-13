import { Page } from '@playwright/test';

/**
 * Settings Page Object
 * 
 * Handles UI interactions for application settings.
 * Similar constraints as AccountPage - selectors and actions only.
 */
export class SettingsPage {
  constructor(private page: Page) {}

  async navigateToSettings() {
    await this.page.click('[data-testid="nav-settings"]');
  }

  async getBaseCurrency() {
    return await this.page.textContent('[data-testid="setting-base-currency"]');
  }

  async changeBaseCurrency(currencyCode: string) {
    await this.page.click('[data-testid="select-base-currency"]');
    await this.page.click(`[data-testid="currency-option-${currencyCode}"]`);
  }
}
