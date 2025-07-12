import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Start Creating Category
 * Handles the workflow for initiating category creation process
 */
export class StartCreatingCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryName: string): Promise<void> {
    logger.info(`Executing start creating category use case: ${categoryName}`);

    await this.categoryService.startCreatingCategory(categoryName);
  }
}
