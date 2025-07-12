import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Try Rename Category
 * Handles the workflow for attempting to rename a category (for validation testing)
 */
export class TryRenameCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(
    originalName: string,
    newName: string
  ): Promise<Error | undefined> {
    logger.info(
      `Executing try rename category use case: ${originalName} to ${newName}`
    );

    try {
      return await this.categoryService.tryRenameCategoryThroughUI(
        originalName,
        newName
      );
    } catch (error) {
      logger.info(
        `Category rename failed as expected: ${(error as Error).message}`
      );
      return error as Error;
    }
  }
}
