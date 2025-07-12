import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Try Create Invalid Length Category
 * Handles the workflow for attempting to create a category with invalid name length (for validation testing)
 */
export class TryCreateInvalidLengthCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(maxLength: number): Promise<Error | undefined> {
    const longName = "A".repeat(maxLength + 10); // Exceed the limit
    logger.info(
      `Executing try create invalid length category use case: ${longName.length} characters`
    );

    try {
      const invalidFormData = new CategoryFormValue({
        name: longName,
        icon: "Default",
        type: "EXPENSE",
      });

      await this.categoryService.createCategoryThroughUI(invalidFormData);
      // If we reach here, no error was thrown (unexpected)
      return new Error("Expected validation error but none was thrown");
    } catch (error) {
      logger.info(
        `Long name category creation failed as expected: ${
          (error as Error).message
        }`
      );
      return error as Error;
    }
  }
}
