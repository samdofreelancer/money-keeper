import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategorySearchValue } from "../../domain/value-objects/category-search-criteria.vo";

/**
 * Use Case: Search For Specific Category
 * Handles the workflow for searching for a specific category by name (Test Category 1)
 */
export class SearchForSpecificCategoryUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing search for specific category use case");

    const searchCriteria = new CategorySearchValue({
      searchTerm: "Test Category 1",
    });
    await this.categoryService.searchCategories(searchCriteria);

    logger.info("Successfully searched for specific category");
  }
}
