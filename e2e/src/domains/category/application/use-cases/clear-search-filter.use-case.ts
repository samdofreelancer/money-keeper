import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategorySearchValue } from "../../domain/value-objects/category-search-criteria.vo";

/**
 * Use Case: Clear Search Filter
 * Handles the workflow for clearing search filters by searching with empty criteria
 */
export class ClearSearchFilterUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing clear search filter use case");

    const searchCriteria = new CategorySearchValue({ searchTerm: "" });
    await this.categoryService.searchCategories(searchCriteria);

    logger.info("Successfully cleared search filter");
  }
}
