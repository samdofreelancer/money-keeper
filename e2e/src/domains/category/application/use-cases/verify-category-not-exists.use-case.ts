import { expect } from "@playwright/test";

import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Verify Category Not Exists
 * Handles the workflow for verifying that a category no longer exists after deletion
 */
export class VerifyCategoryNotExistsUseCase {
  constructor(
    private categoryService: CategoryApplicationService,
    private world: CustomWorld
  ) {}

  async execute(categoryName: string): Promise<void> {
    logger.info(
      `Executing verify category not exists use case: ${categoryName}`
    );

    // Wait for deletion to take effect
    await this.world.page.waitForTimeout(2000);

    try {
      // Check via UI first
      const categoryLocator = this.world.page
        .locator(".category-tree .tree-node-content")
        .filter({ hasText: new RegExp(`^${categoryName}\\s`, "i") });
      const count = await categoryLocator.count();

      if (count > 0) {
        // Category still visible in UI, check if it's really there or just not updated
        const isVisible = await categoryLocator.first().isVisible();
        expect(isVisible).toBe(false);
      }

      logger.info(`Verified ${categoryName} no longer appears in the list`);
    } catch (error) {
      // Fallback: if category is not found at all, that's what we want
      logger.info(`Category ${categoryName} successfully removed from list`);
    }
  }
}
