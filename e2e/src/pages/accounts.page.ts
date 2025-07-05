import { Page, Locator, expect } from '@playwright/test';

export class AccountsPage {
  readonly page: Page;
  readonly addAccountButton: Locator;
  readonly nameInput: Locator;
  readonly typeSelect: Locator;
  readonly balanceInput: Locator;
  readonly saveButton: Locator;
  readonly searchInput: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addAccountButton = page.getByRole('button', { name: 'Add Account' });
    this.nameInput = page.getByLabel('Name');
    this.typeSelect = page.getByLabel('Type');
    this.balanceInput = page.getByLabel('Balance');
    this.saveButton = page.getByRole('button', { name: /Add|Save/i });
    this.searchInput = page.getByPlaceholder('Search accounts...');
    this.table = page.locator('table');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/accounts');
  }

  async addAccount({ name, type, balance }: { name: string; type: string; balance: string | number }) {
    await this.addAccountButton.click();
    await this.nameInput.fill(name);
    await this.typeSelect.click();
    await this.page.getByRole('option', { name: type }).click();
    await this.balanceInput.fill(String(balance));
    await this.saveButton.click();
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async editAccount(oldName: string, newName: string) {
    const row = this.page.getByRole('row', { name: new RegExp(oldName, 'i') });
    await row.getByRole('button', { name: /Edit/i }).click();
    await this.nameInput.fill(newName);
    await this.saveButton.click();
    await expect(this.page.getByText(newName)).toBeVisible();
  }

  async deleteAccount(name: string) {
    const row = this.page.getByRole('row', { name: new RegExp(name, 'i') });
    await row.getByRole('button', { name: /Delete|Remove/i }).click();
    await this.page.getByRole('button', { name: /Confirm|Yes|Delete/i }).click();
    await expect(this.page.getByText(name)).not.toBeVisible();
  }

  async searchAccount(query: string) {
    await this.searchInput.fill(query);
  }

  async isAccountVisible(name: string) {
    const row = this.page.getByRole('row', { name: new RegExp(name, 'i') });
    return row.isVisible();
  }
}
