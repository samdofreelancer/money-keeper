import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";
import { CategoryType } from "../../domain/models/category.model";

/**
 * Use Case: Setup Multiple Categories
 * Handles the workflow for creating multiple categories for test setup
 */
export class SetupMultipleCategoriesUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(
    category1: string,
    category2: string,
    categoryType = "EXPENSE"
  ): Promise<void> {
    logger.info(
      `Executing setup multiple categories use case: ${category1}, ${category2}`
    );

    const formData1 = new CategoryFormValue({
      name: category1,
      icon: "Default",
      type: categoryType as CategoryType,
    });

    const formData2 = new CategoryFormValue({
      name: category2,
      icon: "Default",
      type: categoryType as CategoryType,
    });

    try {
      await this.categoryService.createCategoryThroughAPI(
        formData1.toCreateRequest()
      );
      await this.categoryService.createCategoryThroughAPI(
        formData2.toCreateRequest()
      );
      logger.info(
        `Successfully set up multiple categories: ${category1}, ${category2}`
      );
    } catch (error) {
      // Categories might already exist
      const exists1 = await this.categoryService.categoryExists(category1);
      const exists2 = await this.categoryService.categoryExists(category2);

      if (!exists1 || !exists2) {
        throw new Error(
          `Failed to set up categories: ${category1}=${exists1}, ${category2}=${exists2}`
        );
      }
      logger.info(`Categories already exist: ${category1}, ${category2}`);
    }
  }
}
