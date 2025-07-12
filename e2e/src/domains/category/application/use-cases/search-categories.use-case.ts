import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategorySearchValue } from "../../domain/value-objects/category-search-criteria.vo";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Search Categories
 * Handles the complete workflow for searching categories with logging
 */
export class SearchCategoriesUseCase {
  constructor(
    private categoryService: CategoryApplicationService,
    private world: CustomWorld
  ) {}

  async execute(searchTerm: string): Promise<void> {
    logger.info(`Executing search categories use case: ${searchTerm}`);

    // Get categories before search for comparison
    const categoriesBeforeSearch = await this.world.page
      .locator(".category-tree .tree-node-content")
      .allTextContents();
    logger.info(
      `Categories before search: ${categoriesBeforeSearch.length} items`
    );

    const searchCriteria = new CategorySearchValue({ searchTerm });
    await this.categoryService.searchCategories(searchCriteria);

    // Wait additional time for search filtering to take effect
    await this.world.page.waitForTimeout(3000);

    // Get categories after search for comparison
    const categoriesAfterSearch = await this.world.page
      .locator(".category-tree .tree-node-content")
      .allTextContents();
    logger.info(
      `Categories after search: ${categoriesAfterSearch.length} items`
    );
    logger.info(
      `Search term "${searchTerm}" resulted in: ${categoriesAfterSearch.join(
        ", "
      )}`
    );
  }
}
