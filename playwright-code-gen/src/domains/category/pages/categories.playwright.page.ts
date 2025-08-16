import { Logger } from '../../../shared/utilities/logger';
import { Page, expect } from '@playwright/test';

export class CategoriesPage {
  constructor(private page: Page) {}

  async goto() {
    Logger.info('Navigating to categories page');
    await this.page.goto('/categories');
    await expect(this.page).toHaveURL(/\/categories\b/);
    await expect(this.page.getByTestId('category-tree')).toBeVisible();
    Logger.info('Categories page loaded');
  }

  async clickAddCategoryButton() {
    await this.page.getByTestId('add-category-button').click();
  }

  async fillCategoryName(name: string) {
    const input = this.page.getByTestId('input-category-name');
    await input.fill(''); // clear first
    await input.fill(name);
  }

  async selectIcon(iconName: string) {
    // Use stable trigger with test ID
    const trigger = this.page.getByTestId('select-icon');
    await trigger.click();

    // Try to find by role first (most stable)
    const byRole = this.page.getByRole('option', { name: iconName, exact: true });
    if (await byRole.count()) {
      await byRole.first().click();
      return;
    }

    // Fallback to test ID per option
    const iconOption = this.page.getByTestId(`icon-option-${iconName}`);
    if (await iconOption.count()) {
      await iconOption.click();
      return;
    }

    // Last resort: use exact text match
    await this.page.getByText(iconName, { exact: true }).click();
  }

  async selectType(type: 'Expense' | 'Income') {
    const radio = this.page.getByRole('radio', { name: type });
    if (await radio.count()) {
      await radio.first().check();
    } else {
      await this.page.getByTestId(`radio-${type.toLowerCase()}`).click();
    }
  }

  async clickSubmitButton() {
    await this.page.getByTestId('button-submit').click();
  }

  findCategoryRowByName(categoryName: string) {
    return this.page
      .getByTestId('category-tree')
      .getByTestId('tree-node-content')
      .filter({ has: this.page.getByText(categoryName, { exact: true }) });
  }

  async clickDeleteCategoryButton(categoryName: string) {
    const categoryRow = await this.findCategoryRowByName(categoryName);
    await categoryRow.getByTestId('delete-category-button').click();
  }

  async clickConfirmDeleteButton() {
    await this.page.getByTestId('button-confirm-delete').click();
    await this.page.waitForResponse(r =>
      r.url().includes('/api/categories') && r.request().method() === 'GET' && r.ok()
    );
  }

async categoryExists(categoryName: string): Promise<boolean> {
    const categoryRow = await this.findCategoryRowByName(categoryName);
    const count = await categoryRow.count();
    return count === 1;
  }

async categoryNotExists(categoryName: string): Promise<boolean> {
    const categoryRow = await this.findCategoryRowByName(categoryName);
    const count = await categoryRow.count();
    return count === 0;
  }

  async waitForCategoryTreeToLoad() {
    await expect(this.page.getByTestId('category-tree')).toBeVisible();
  }

  async verifyNoDataMessageNotVisible() {
    await expect(this.page.getByTestId('no-data')).toBeHidden();
  }
}
