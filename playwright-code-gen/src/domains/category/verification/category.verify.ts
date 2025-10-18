import { Page, expect } from '@playwright/test';
import { CategoriesPage } from '../pages/categories.playwright.page';

export class CategoryVerify {
  constructor(private readonly page: Page, private readonly categoriesPage: CategoriesPage) {}

  async shouldSeeSuccessMessage(expectedMessage: string) {
    const locator = this.page.locator('text=' + expectedMessage).first();
    await expect(locator).toBeVisible();
  }

  async shouldSeeValidationErrorForName() {
    const msg = this.page.getByText(/Please input category name|Please input category name/);
    await expect(msg).toBeVisible();
  }

  async shouldSeeNameExistsError() {
    const msg = this.page.getByText(/Category name already exists|already exists/);
    await expect(msg).toBeVisible();
  }

  async shouldSeeCategoryUnderParent(child: string, parent: string) {
    const childExists = await this.categoriesPage.hasCategory(child);
    expect(childExists).toBe(true);

    const parentExists = await this.categoriesPage.hasCategory(parent);
    expect(parentExists).toBe(true);
  }

  async shouldSeeCategoryInList(name: string) {
    const exists = await this.categoriesPage.hasCategory(name);
    expect(exists).toBe(true);
  }

  async shouldNotSeeCategoryInList(name: string) {
    const exists = await this.categoriesPage.hasCategory(name);
    expect(exists).toBe(false);
  }

  async shouldSeeCategoryInResults(name: string) {
    const exists = await this.categoriesPage.hasCategory(name);
    expect(exists).toBe(true);
  }
}
