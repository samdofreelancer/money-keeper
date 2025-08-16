import { Page, expect } from '@playwright/test';

export class CategoriesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/categories');
  }

  async clickAddCategoryButton() {
    await this.page.getByTestId('add-category-button').click();
  }

  async fillCategoryName(name: string) {
    await this.page.getByTestId('input-category-name').click();
    await this.page.getByTestId('input-category-name').fill(name);
  }

  async selectIcon(iconName: string) {
    await this.page.getByTestId('select-icon').locator('div').nth(3).click();
    await this.page.getByText(iconName).click();
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
