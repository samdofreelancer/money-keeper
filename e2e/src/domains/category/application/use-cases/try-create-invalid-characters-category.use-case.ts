import { logger } from "../../../../shared/utils/logger";

/**
 * Use Case: Try Create Invalid Characters Category
 * Handles the workflow for attempting to create a category with invalid characters (for validation testing)
 */
export class TryCreateInvalidCharactersCategoryUseCase {
  async execute(invalidChars: string): Promise<Error | undefined> {
    logger.info(
      `Executing try create invalid characters category use case: ${invalidChars}`
    );

    try {
      // First validate the input using our validation service
      const validationService = new (
        await import("../services/CategoryValidationService")
      ).CategoryValidationService();

      const formData = {
        name: { value: invalidChars },
        icon: { value: "Default" },
        type: "EXPENSE" as const,
        parentCategory: { value: "" },
      };

      // This should throw a validation error
      validationService.validateCategoryData(formData);

      // If we reach here, validation didn't catch the error
      return new Error("Expected validation error but none was thrown");
    } catch (error) {
      logger.info(
        "Category validation failed as expected due to invalid characters"
      );
      return error as Error;
    }
  }
}
