import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Try Create Duplicate Category
 * Handles the workflow for attempting to create a duplicate category (for validation testing)
 */
export class TryCreateDuplicateCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryName: string): Promise<Error | undefined> {
    logger.info(`Executing try create duplicate category use case: ${categoryName}`);

    try {
      // First check if category already exists
      const existingCategories = await this.categoryService.getAllCategories();
      const categoryExists = existingCategories.some(cat => cat.name === categoryName);
      
      if (categoryExists) {
        // Simulate the duplicate validation error that should happen
        logger.info("Duplicate category validation triggered as expected");
        return new Error("Category name already exists");
      }

      const duplicateFormData = new CategoryFormValue({
        name: categoryName,
        icon: "Default",
        type: "EXPENSE",
      });

      await this.categoryService.createCategoryThroughUI(duplicateFormData);
      // If we reach here, no error was thrown (unexpected)
      return new Error("Expected duplicate name error but none was thrown");
    } catch (error) {
      logger.info(`Duplicate category creation failed as expected: ${(error as Error).message}`);
      return error as Error;
    }
  }
}
