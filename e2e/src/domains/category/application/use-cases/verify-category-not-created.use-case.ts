import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Verify Category Not Created
 * Handles the workflow for verifying that a category was not created (simple existence check)
 */
export class VerifyCategoryNotCreatedUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryName: string): Promise<void> {
    logger.info(
      `Executing verify category not created use case: ${categoryName}`
    );

    await this.categoryService.verifyCategoryNotCreated(categoryName);
  }
}
