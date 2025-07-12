import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategorySearchValue } from "../../domain/value-objects/category-search-criteria.vo";

/**
 * Use Case: Search Specific Category
 * Handles the workflow for searching for a specific category with predefined search criteria
 */
export class SearchSpecificCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing search specific category use case");

    const searchCriteria = new CategorySearchValue({ searchTerm: "Test" });
    await this.categoryService.searchCategories(searchCriteria);

    logger.info("Successfully performed search for specific category");
  }
}
