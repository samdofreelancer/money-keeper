import { expect } from "@playwright/test";

import { logger } from "../../../../shared/utils/logger";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Verify Category in Results
 * Handles the workflow for verifying if a category appears in search results
 */
export class VerifyCategoryInResultsUseCase {
  constructor(private world: CustomWorld) {}

  async execute(categoryName: string, shouldBeVisible = true): Promise<void> {
    logger.info(
      `Executing verify category in results use case: ${categoryName}, should be visible: ${shouldBeVisible}`
    );

    // Wait a moment for search to complete
    await this.world.page.waitForTimeout(2000);

    // Debug: Get all visible category texts to understand the structure
    const allCategoryTexts = await this.world.page
      .locator(".category-tree .tree-node-content")
      .allTextContents();
    logger.info(`All visible categories: ${JSON.stringify(allCategoryTexts)}`);

    // Check if the category name appears in any of the visible text content
    const categoryFound = allCategoryTexts.some((text) =>
      text.toLowerCase().includes(categoryName.toLowerCase())
    );

    if (shouldBeVisible) {
      if (!categoryFound) {
        logger.error(
          `Category "${categoryName}" not found in visible categories: ${allCategoryTexts.join(
            ", "
          )}`
        );
      }
      expect(categoryFound).toBe(true);
    } else {
      if (categoryFound) {
        logger.error(
          `Category "${categoryName}" unexpectedly found in visible categories: ${allCategoryTexts.join(
            ", "
          )}`
        );
      }
      expect(categoryFound).toBe(false);
    }
  }
}
