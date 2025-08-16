import { Logger } from '../../../shared/utilities/logger';
import { Page, expect, Locator } from '@playwright/test';

export class CategoriesPage {
  constructor(private page: Page) {}

  async goto() {
    Logger.info('Navigating to categories page');
    await this.page.goto('/categories');
    await expect(this.page).toHaveURL(/\/categories\b/);
    await expect(this.categoryTree).toBeVisible();
    Logger.info('Categories page loaded');
  }

  async clickAddCategoryButton() {
    await this.addCategoryButton.click();
  }

  async fillCategoryName(name: string) {
    const input = this.page.getByTestId('input-category-name');
    await expect(input).toBeEditable();
    await input.fill(''); // clear first
    await input.fill(name);
  }

  async selectIcon(iconName: string) {
    const trigger = this.page.getByTestId('select-icon');
    await trigger.click();

    const panel = this.page
      .getByRole('listbox')
      .or(this.page.getByRole('menu'))
      .or(this.page.getByTestId('icon-list'));
    
    await panel.first().waitFor();

    const byRole = panel.getByRole('option', { name: iconName, exact: true });
    if (await byRole.count()) {
      await byRole.first().click();
      return;
    }

    const iconOption = panel.getByTestId(`icon-option-${iconName}`);
    if (await iconOption.count()) {
      await iconOption.first().click();
      return;
    }

    await panel.getByText(iconName, { exact: true }).first().click();
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
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  findCategoryRowByName(categoryName: string): Locator {
    return this.page
      .getByTestId('category-tree')
      .getByTestId('tree-node-content')
      .filter({ has: this.page.getByText(categoryName, { exact: true }) });
  }

  async clickDeleteCategoryButton(categoryName: string) {
    const categoryRow = this.findCategoryRowByName(categoryName).first();
    await expect(categoryRow).toBeVisible();
    await categoryRow.getByTestId('delete-category-button').click();
  }

  async clickConfirmDeleteButton() {
    await expect(this.confirmDeleteButton).toBeEnabled();
    await this.confirmDeleteButton.click();
  }

  async categoryExists(categoryName: string): Promise<boolean> {
    const categoryRow = this.findCategoryRowByName(categoryName);
    const count = await categoryRow.count();
    return count > 0;
  }

  async categoryNotExists(categoryName: string): Promise<boolean> {
    const categoryRow = this.findCategoryRowByName(categoryName);
    const count = await categoryRow.count();
    return count === 0;
  }

  async waitForCategoryTreeToLoad() {
    await expect(this.categoryTree).toBeVisible();
  }

  get categoryTree() {
    return this.page.getByTestId('category-tree');
  }

  get addCategoryButton() {
    return this.page.getByTestId('add-category-button');
  }

  get submitButton() {
    return this.page.getByTestId('button-submit');
  }

  get confirmDeleteButton() {
    return this.page.getByTestId('button-confirm-delete');
  }

  get noDataMessage() {
    return this.page.getByTestId('no-data');
  }

  async noDataMessageHidden(): Promise<boolean> {
    return await this.noDataMessage.isHidden();
  }
}
