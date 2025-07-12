import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Cancel Category Deletion
 * Handles the workflow for canceling category deletion process
 */
export class CancelCategoryDeletionUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing cancel category deletion use case");

    await this.categoryService.cancelCurrentOperation();

    logger.info("Successfully cancelled deletion");
  }
}
