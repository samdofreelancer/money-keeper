import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategorySearchValue } from "../../domain/value-objects/category-search-criteria.vo";
import { CategoryType } from "../../domain/models/category.model";

/**
 * Use Case: Filter By Category Type
 * Handles the workflow for filtering categories by their type (income/expense)
 */
export class FilterByCategoryTypeUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(categoryType: string): Promise<void> {
    logger.info(
      `Executing filter by category type use case: ${categoryType} categories`
    );

    const searchCriteria = new CategorySearchValue({
      categoryType: categoryType.toUpperCase() as CategoryType,
    });
    await this.categoryService.searchCategories(searchCriteria);

    logger.info(`Successfully filtered by ${categoryType} categories`);
  }
}
