import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Setup Multiple Test Categories
 * Handles the workflow for creating multiple test categories for test setup
 */
export class SetupMultipleTestCategoriesUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing setup multiple test categories use case");

    const categories = ["Test Category 1", "Test Category 2", "Test Category 3"];

    for (const categoryName of categories) {
      const formData = new CategoryFormValue({
        name: categoryName,
        icon: "Default",
        type: "EXPENSE",
      });

      try {
        await this.categoryService.createCategoryThroughAPI(
          formData.toCreateRequest()
        );
        logger.info(`Successfully created category: ${categoryName}`);
      } catch (error) {
        // Category might already exist
        const exists = await this.categoryService.categoryExists(categoryName);
        if (!exists) {
          throw new Error(`Failed to set up category: ${categoryName}`);
        }
        logger.info(`Category already exists: ${categoryName}`);
      }
    }

    logger.info("Successfully set up multiple test categories");
  }
}
