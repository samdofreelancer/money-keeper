import { logger } from "../../../../support/logger";
import { CategoryApiPort } from "../../domain/ports/category-api.port";

export class CategoryCleanupService {
  private readonly categoryApiPort: CategoryApiPort;

  constructor(categoryApiPort: CategoryApiPort) {
    this.categoryApiPort = categoryApiPort;
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
    await this.cleanupByIds(categoryIds, false);
    await this.cleanupByIds(parentCategoryIds, true);
    logger.info("Category cleanup completed");
  }

  // Single Responsibility: handles only deletion by IDs
  private async cleanupByIds(ids?: string[], isParent = false): Promise<void> {
    if (!ids || ids.length === 0) return;
    const type = isParent ? "parent " : "";
    logger.info(`Cleaning up ${ids.length} ${type}categories via API (by ID)`);
    const deletePromises = ids.map(async (categoryId: string) => {
      try {
        await this.categoryApiPort.deleteCategory(categoryId);
        logger.info(
          `Successfully cleaned up ${type}category ID: ${categoryId}`
        );
        return true;
      } catch (error) {
        logger.error(
          `Failed to cleanup ${type}category ID ${categoryId}: ${error}`
        );
        return false;
      }
    });
    await Promise.allSettled(deletePromises);
  }
}
