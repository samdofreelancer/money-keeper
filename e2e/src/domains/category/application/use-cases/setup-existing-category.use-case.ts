import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";
import { CategoryType } from "../../domain/models/category.model";

/**
 * Use Case: Setup Existing Category
 * Handles the workflow for creating a category for test setup
 */
export class SetupExistingCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryName: string, categoryType = "EXPENSE"): Promise<void> {
    logger.info(`Executing setup existing category use case: ${categoryName}`);

    const formData = new CategoryFormValue({
      name: categoryName,
      icon: "Default",
      type: categoryType as CategoryType,
    });

    try {
      await this.categoryService.createCategoryThroughAPI(
        formData.toCreateRequest()
      );
      const exists = await this.categoryService.categoryExists(categoryName);
      if (!exists) {
        throw new Error(`Failed to verify category creation: ${categoryName}`);
      }
      logger.info(`Successfully set up existing category: ${categoryName}`);
    } catch (error) {
      // Category might already exist, verify it's there
      const exists = await this.categoryService.categoryExists(categoryName);
      if (!exists) {
        throw new Error(
          `Category does not exist and could not be created: ${categoryName}`
        );
      }
      logger.info(`Category already exists: ${categoryName}`);
    }
  }
}
