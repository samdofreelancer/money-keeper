import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Try Create Empty Name Category
 * Handles the workflow for attempting to create a category without a name (for validation testing)
 */
export class TryCreateEmptyNameCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<Error | undefined> {
    logger.info("Executing try create empty name category use case");

    try {
      const invalidFormData = new CategoryFormValue({
        name: "",
        icon: "Default",
        type: "EXPENSE",
      });

      await this.categoryService.createCategoryThroughUI(invalidFormData);
      // If we reach here, no error was thrown (unexpected)
      return new Error("Expected validation error but none was thrown");
    } catch (error) {
      logger.info("Category creation failed as expected due to validation");
      return error as Error;
    }
  }
}
