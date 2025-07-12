import { After } from "@cucumber/cucumber";

import { CustomWorld } from "../../../support/world";
import { CategoryApiClient } from "../../../domains/category/infrastructure/api/category-api-client";
import { Category } from "../../../domains/category/domain/models/category.model";
import { logger } from "../../../support/logger";
import { config } from "../../config/env.config";

After({ tags: "not @no-cleanup" }, async function (this: CustomWorld) {
  try {
    const categoryApiClient = new CategoryApiClient({
      baseURL: config.browser.baseUrl,
    });

    // Cleanup by ID for categories created via API
    if (this.createdCategoryIds && this.createdCategoryIds.length > 0) {
      logger.info(
        `Cleaning up ${this.createdCategoryIds.length} categories by ID.`
      );
      const deletePromises = this.createdCategoryIds.map((id: string) =>
        categoryApiClient.deleteCategory(id)
      );
      await Promise.all(deletePromises);
      this.createdCategoryIds = []; // Reset after cleanup
    }

    // Fallback cleanup by name for categories created via UI
    if (this.createdCategoryNames && this.createdCategoryNames.length > 0) {
      logger.info(
        `Cleaning up ${this.createdCategoryNames.length} categories by name.`
      );
      const allCategories: Category[] =
        await categoryApiClient.getAllCategories();
      const categoriesToDelete = allCategories.filter((category) =>
        this.createdCategoryNames.includes(category.name)
      );

      if (categoriesToDelete.length > 0) {
        const deletePromises = categoriesToDelete.map((category) =>
          categoryApiClient.deleteCategory(category.id)
        );
        await Promise.all(deletePromises);
      }
      this.createdCategoryNames = []; // Reset after cleanup
    }
  } catch (error) {
    logger.error("Error during cleanup:", error);
    // We log the error but do not rethrow, to avoid masking other test failures
  }
});
