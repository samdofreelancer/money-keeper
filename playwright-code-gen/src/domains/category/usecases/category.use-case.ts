import { Page, expect } from '@playwright/test';
import { CategoriesPage } from '../pages/categories.playwright.page';
import { CategoryApiClient } from '../api/category-api.client';

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
    await this.categoriesPage.goto();
    await this.categoriesPage.clickAddCategoryButton();
    await this.categoriesPage.fillCategoryName(categoryData.name);
    await this.categoriesPage.selectIcon(categoryData.icon);
    await this.categoriesPage.selectType(categoryData.type);
    await this.categoriesPage.clickSubmitButton();
  }

  async deleteCategoryIfExists(categoryName: string): Promise<void> {
    const category = await this.categoryApiClient.getCategoryByName(categoryName);
    if (category) {
      await this.categoryApiClient.deleteCategory(category.id);
    }
  }

  async verifyCategoryExists(categoryName: string): Promise<boolean> {
    return this.categoriesPage.verifyCategoryExists(categoryName);
  }

  async verifyCategoryNotExists(categoryName: string): Promise<boolean> {
    return this.categoriesPage.verifyCategoryNotExists(categoryName);
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
