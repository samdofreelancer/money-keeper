import { expect } from '@playwright/test';
import { CategoriesPage } from '../pages/categories.playwright.page';
import { TOKENS } from 'shared/di/tokens';
import { Inject, Transient } from 'shared/di/decorators';

@Transient({ token: TOKENS.CategoriesVerification })
export class CategoriesVerification {
  constructor(
    @Inject(TOKENS.CategoriesPage)
    private readonly categoriesPage: CategoriesPage
  ) {}

  async verifyCategoryExists(name: string): Promise<void> {
    const categoryExists = await this.categoriesPage.hasCategory(name);
    expect(categoryExists).toBe(true);
  }

  async verifyCategoryDoesNotExist(name: string): Promise<void> {
    const categoryExists = await this.categoriesPage.hasCategory(name);
    expect(categoryExists).toBe(false);
  }
}
