import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Verify Current Category In List
 * Handles the workflow for verifying if the current category appears in the category list
 */
export class VerifyCurrentCategoryInListUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing verify current category in list use case");

    await this.categoryService.verifyCurrentCategoryInList();
  }
}
