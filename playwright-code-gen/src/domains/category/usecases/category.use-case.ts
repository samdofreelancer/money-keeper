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

  async createCategoryWithoutParent(categoryData: {
    name: string;
    icon: string;
    type: 'Expense' | 'Income';
  }): Promise<void> {
    Logger.info(`Starting category creation with data: ${JSON.stringify(categoryData)}`);
    
    Logger.debug('Clicking add category button...');
    await this.categoriesPage.clickAddCategoryButton();
    Logger.debug('Add category button clicked successfully');
    
    Logger.debug(`Filling category name: ${categoryData.name}`);
    await this.categoriesPage.fillCategoryName(categoryData.name);
    Logger.debug('Category name filled successfully');
    
    Logger.debug(`Selecting icon: ${categoryData.icon}`);
    await this.categoriesPage.selectIcon(categoryData.icon);
    Logger.debug('Icon selected successfully');
    
    Logger.debug(`Selecting type: ${categoryData.type}`);
    await this.categoriesPage.selectType(categoryData.type);
    Logger.debug('Type selected successfully');
    
    Logger.debug('Submitting category form...');
    await this.categoriesPage.clickSubmitButton();
    Logger.debug('Category form submitted successfully');
    
    Logger.debug(`Category creation completed for: ${categoryData.name}`);
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
