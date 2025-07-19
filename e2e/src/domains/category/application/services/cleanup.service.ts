import { logger } from '../../../../support/logger';
import { CategoryApiClient } from '../../infrastructure/api/category-api.client';

export class CategoryCleanupService {
  private categoryApiClient: CategoryApiClient;

  constructor(categoryApiClient: CategoryApiClient) {
    this.categoryApiClient = categoryApiClient;
  }

  /**
   * Cleans up categories in correct order: children first, then parents.
   * @param categoryIds - array of child category IDs
   * @param parentCategoryIds - array of parent category IDs
   */
  async cleanupCategories(
    categoryIds: string[],
    parentCategoryIds?: string[]
  ): Promise<void> {
    // Clean up child categories first
    if (categoryIds && categoryIds.length > 0) {
      logger.info(
        `Cleaning up ${categoryIds.length} created categories via API (by ID)`
      );
      const deletePromises = categoryIds.map(async (categoryId: string) => {
        try {
          await this.categoryApiClient.deleteCategory(categoryId);
          logger.info(`Successfully cleaned up category ID: ${categoryId}`);
          return true;
        } catch (error) {
          logger.error(`Failed to cleanup category ID ${categoryId}: ${error}`);
          return false;
        }
      });
      await Promise.allSettled(deletePromises);
    }
    // Then clean up parent categories
    if (parentCategoryIds && parentCategoryIds.length > 0) {
      logger.info(
        `Cleaning up ${parentCategoryIds.length} parent categories via API (by ID)`
      );
      const deletePromises = parentCategoryIds.map(async (categoryId: string) => {
        try {
          await this.categoryApiClient.deleteCategory(categoryId);
          logger.info(`Successfully cleaned up parent category ID: ${categoryId}`);
          return true;
        } catch (error) {
          logger.error(`Failed to cleanup parent category ID ${categoryId}: ${error}`);
          return false;
        }
      });
      await Promise.allSettled(deletePromises);
    }
    logger.info('Category cleanup completed');
  }
}
