import { Page } from '@playwright/test';
import { Inject, Transient, TOKENS } from 'shared/di';

@Transient({ token: TOKENS.SettingsPlaywrightPage })
export class SettingsPlaywrightPage {
  constructor(@Inject(TOKENS.Page) private page: Page) {}

  private selectors = {
    nav: {
      settings: 'text=Settings',
    },
    settingsPage: '[data-testid="settings-page"]',
    linkDefaultCurrency: '[data-testid="link-default-currency"]',
    currencySelectInDialog: '.el-dialog .el-select',
    currencyOptionByCode: (code: string) =>
      `.el-select-dropdown__item:has-text("${code}")`,
    dialog: '.el-dialog',
    saveButton: '.el-dialog .el-button:has-text("Save")',
  };

  async goto() {
    await this.page.goto('/settings');
    await this.page.waitForSelector(this.selectors.settingsPage);
  }

  async openCurrencyDialog() {
    await this.page.click(this.selectors.linkDefaultCurrency);
    await this.page.waitForSelector(this.selectors.dialog, {
      state: 'visible',
    });
  }

  async chooseCurrencyByCode(code: string) {
    await this.page.click(this.selectors.currencySelectInDialog);
    await this.page.click(this.selectors.currencyOptionByCode(code));
  }

  async saveCurrency() {
    await this.page.click(this.selectors.saveButton);
    await this.page.waitForSelector(this.selectors.dialog, { state: 'hidden' });
  }

  async setDefaultCurrency(code: string) {
    await this.goto();
    await this.openCurrencyDialog();
    await this.chooseCurrencyByCode(code);
    await this.saveCurrency();
  }
}
