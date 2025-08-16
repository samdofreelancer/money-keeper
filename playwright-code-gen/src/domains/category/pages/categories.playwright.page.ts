import { Logger } from '../../../shared/utilities/logger';
import { Page, expect } from '@playwright/test';

export class CategoriesPage {
  constructor(private page: Page) {}

  async goto() {
    Logger.info('Navigating to categories page');
    await this.page.goto('/categories');
    Logger.info('Categories page loaded');
  }

  async clickAddCategoryButton() {
    await this.page.getByTestId('add-category-button').click();
  }

  async fillCategoryName(name: string) {
    await this.page.getByTestId('input-category-name').click();
    await this.page.getByTestId('input-category-name').fill(name);
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
    await this.page.getByTestId(`radio-${type.toLowerCase()}`).getByText(type).click();
  }

  async clickSubmitButton() {
    await this.page.getByTestId('button-submit').click();
  }

  async findCategoryRowByName(categoryName: string) {
    return this.page.getByTestId('category-tree').locator('div[data-testid="tree-node-content"]').filter({ hasText: categoryName });
  }

  async clickDeleteCategoryButton(categoryName: string) {
    const categoryRow = await this.findCategoryRowByName(categoryName);
    await categoryRow.getByTestId('delete-category-button').click();
  }

  async clickConfirmDeleteButton() {
    await this.page.getByTestId('button-confirm-delete').click();
  }

  async verifyCategoryExists(categoryName: string): Promise<boolean> {
    const categoryRow = await this.findCategoryRowByName(categoryName);
    const count = await categoryRow.count();
    return count === 1;
  }

  async verifyCategoryNotExists(categoryName: string): Promise<boolean> {
    const categoryRow = await this.findCategoryRowByName(categoryName);
    const count = await categoryRow.count();
    return count === 0;
  }

  async waitForCategoryTreeToLoad() {
    await expect(this.page.getByTestId('category-tree')).toBeVisible();
  }

  async verifyNoDataMessageNotVisible() {
    await expect(this.page.getByTestId('category-tree')).not.toContainText('No Data');
  }
}
