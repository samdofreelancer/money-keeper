import { Page } from '@playwright/test';
import { selectors } from './accounts-selectors';
import { IAccountsNavigation } from './accounts-interfaces';

export class AccountsNavigation implements IAccountsNavigation {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToCategoriesPage() {
    await this.page.goto(selectors.navigation.categoriesPage);
  }

  async clickAccountsTab() {
    await this.page.locator(selectors.buttons.accountsTab).click();
  }

  async navigateToAccountsPage() {
    await this.page.goto(selectors.navigation.accountsPage);
  }
}
