import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Verify Category Not In List
 * Handles the workflow for verifying that a category no longer appears in the category list
 */
export class VerifyCategoryNotInListUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryName: string): Promise<void> {
    logger.info(
      `Executing verify category not in list use case: ${categoryName}`
    );

    await this.categoryService.verifyCategoryNotInList(categoryName);
  }
}
