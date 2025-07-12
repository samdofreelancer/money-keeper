import { expect } from "@playwright/test";

import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Verify Category Exists
 * Handles the workflow for verifying if a category exists and is available for use
 */
export class VerifyCategoryExistsUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryName: string): Promise<void> {
    logger.info(`Executing verify category exists use case: ${categoryName}`);

    try {
      const exists = await this.categoryService.categoryExists(categoryName);
      expect(exists).toBe(true);
      logger.info(`Successfully verified category exists: ${categoryName}`);
    } catch (error) {
      logger.error(
        `Category verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }
}
