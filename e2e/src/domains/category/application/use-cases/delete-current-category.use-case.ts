import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Delete Current Category
 * Handles the complete workflow for deleting the current category in BDD scenarios
 */
export class DeleteCurrentCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing delete current category use case");

    // Get the current category name from context
    const categoryName = this.categoryService.getCurrentCategoryName();

    if (!categoryName) {
      logger.info("No current category to delete");
      return;
    }

    try {
      // Check if category exists before trying to delete
      const exists = await this.categoryService.categoryExists(categoryName);
      if (exists) {
        await this.categoryService.deleteCategory(categoryName);
        logger.info(`Category "${categoryName}" deleted successfully`);
      } else {
        logger.info(`Category "${categoryName}" not found, skipping deletion`);
      }
    } catch (error) {
      logger.error(`Failed to delete category ${categoryName}: ${error}`);
      // Don't throw - deletion might have succeeded or category might not exist
    }
  }
}
