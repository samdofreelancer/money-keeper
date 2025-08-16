import { Page, expect } from '@playwright/test';
import { CategoriesPage } from '../pages/categories.playwright.page';
import { CategoryApiClient } from '../api/category-api.client';
import { Logger } from '../../../shared/utilities/logger';

export class CategoryUseCase {
  public categoriesPage: CategoriesPage;
  private categoryApiClient: CategoryApiClient;

  constructor(public page: Page) {
    this.categoriesPage = new CategoriesPage(page);
    this.categoryApiClient = new CategoryApiClient(page.request);
  }

  async createCategoryAndWait(name: string, type: 'Expense' | 'Income', icon: string): Promise<void> {
    Logger.info(`Starting category creation with data: ${JSON.stringify({ name, type, icon })}`);
    
    Logger.debug('Clicking add category button...');
    await this.categoriesPage.clickAddCategoryButton();
    Logger.debug('Add category button clicked successfully');
    
    Logger.debug(`Filling category name: ${name}`);
    await this.categoriesPage.fillCategoryName(name);
    Logger.debug('Category name filled successfully');
    
    Logger.debug(`Selecting icon: ${icon}`);
    await this.categoriesPage.selectIcon(icon);
    Logger.debug('Icon selected successfully');
    
    Logger.debug(`Selecting type: ${type}`);
    await this.categoriesPage.selectType(type);
    Logger.debug('Type selected successfully');
    
    Logger.debug('Submitting category form...');
    await Promise.all([
      this.page.waitForResponse(r =>
        r.url().includes('/api/categories') && r.request().method() === 'POST' && r.ok()
      ),
      this.categoriesPage.clickSubmitButton()
    ]);
    Logger.debug('Category form submitted successfully');
    
    await expect(this.categoriesPage.findCategoryRowByName(name)).toBeVisible();
    Logger.debug(`Category creation completed for: ${name}`);
  }

  async confirmDeleteAndWait(name: string): Promise<void> {
    Logger.debug(`Confirming deletion for category: ${name}`);
    
    await Promise.all([
      this.page.waitForResponse(r =>
        r.url().includes('/api/categories') && r.request().method() === 'GET' && r.ok()
      ),
      this.categoriesPage.clickConfirmDeleteButton()
    ]);
    
    await expect(this.categoriesPage.findCategoryRowByName(name)).toHaveCount(0);
    Logger.debug(`Category deletion confirmed for: ${name}`);
  }

  async createCategoryWithoutParent(categoryData: {
    name: string;
    icon: string;
    type: 'Expense' | 'Income';
  }): Promise<void> {
    await this.createCategoryAndWait(categoryData.name, categoryData.type, categoryData.icon);
  }

  async deleteCategoryIfExists(categoryName: string): Promise<void> {
    const category = await this.categoryApiClient.getCategoryByName(categoryName);
    if (category) {
      await this.categoryApiClient.deleteCategory(category.id);
    }
  }

  async categoryExists(categoryName: string): Promise<boolean> {
    return this.categoriesPage.categoryExists(categoryName);
  }

  async categoryNotExists(categoryName: string): Promise<boolean> {
    return this.categoriesPage.categoryNotExists(categoryName);
  }

  async waitForCategoryTreeToLoad(): Promise<void> {
    await this.categoriesPage.waitForCategoryTreeToLoad();
  }

  async verifyCategoryTreeDoesNotShowText(text: string): Promise<void> {
    await this.categoriesPage.waitForCategoryTreeToLoad();
    await expect(this.page.getByTestId('category-tree')).not.toContainText(text);
  }

  generateTestName(prefix: string = 'test'): string {
    return `${prefix}_${Date.now()}`;
  }
}
