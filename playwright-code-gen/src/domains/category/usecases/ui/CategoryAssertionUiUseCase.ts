import { CategoriesPage } from 'category-domain/pages/categories.playwright.page';
import { Inject, Transient, TOKENS } from 'shared/di';
import { Logger } from 'shared/utilities/logger';

/**
 * Use case for category assertion and verification via UI
 */
@Transient({ token: TOKENS.CategoryAssertionUiUseCase })
export class CategoryAssertionUiUseCase {
  constructor(
    @Inject(TOKENS.CategoriesPage)
    private categoriesPage: CategoriesPage
  ) {}

  /**
   * Verify that a category exists in the category list
   */
  async verifyCategory(name: string): Promise<void> {
    const exists = await this.categoriesPage.hasCategory(name);
    if (!exists) {
      throw new Error(`Category not found in list: ${name}`);
    }
    Logger.info(`✓ Verified category exists: ${name}`);
  }

  /**
   * Verify that a category does not exist in the category list
   */
  async verifyNoCategory(name: string): Promise<void> {
    const exists = await this.categoriesPage.hasCategory(name);
    if (exists) {
      throw new Error(`Category still exists after cleanup: ${name}`);
    }
    Logger.info(`✓ Verified category does not exist: ${name}`);
  }

  /**
   * Verify that the empty state is visible (no categories)
   */
  async verifyEmptyState(): Promise<void> {
    const isEmpty = await this.categoriesPage.isEmptyStateVisible();
    if (!isEmpty) {
      throw new Error('Expected empty state but categories were visible');
    }
    Logger.info('✓ Verified empty state is visible');
  }
}
