import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Start Editing Category
 * Handles the workflow for initiating category name editing process
 */
export class StartEditingCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(newName: string): Promise<void> {
    logger.info(`Executing start editing category use case: ${newName}`);

    await this.categoryService.startEditingCategoryName(newName);
  }
}
