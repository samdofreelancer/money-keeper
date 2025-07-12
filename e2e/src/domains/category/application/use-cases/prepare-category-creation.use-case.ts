import { logger } from "../../../../shared/utils/logger";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";
import { CategoryType } from "../../domain/models/category.model";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Prepare Category Creation
 * Handles the workflow for preparing category creation by setting up form data
 */
export class PrepareCategoryCreationUseCase {
  constructor(private world: CustomWorld) {}

  async execute(categoryType: string, categoryName: string): Promise<void> {
    logger.info(
      `Executing prepare category creation use case: ${categoryType} category: ${categoryName}`
    );

    const formData = new CategoryFormValue({
      name: categoryName,
      icon: "Default",
      type: categoryType.toUpperCase() as CategoryType,
    });

    this.world.currentFormData = formData;
    this.world.currentCategoryName = categoryName;

    logger.info("Successfully prepared category creation");
  }
}
