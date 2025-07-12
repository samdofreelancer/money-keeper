import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Create Category with Icon
 * Handles the complete workflow for creating a new category with specified icon
 */
export class CreateCategoryWithIconUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(
    iconName: string,
    currentFormData: CategoryFormValue
  ): Promise<void> {
    logger.info(`Executing create category with icon use case: ${iconName}`);

    // Update form data with icon
    const updatedFormData = new CategoryFormValue({
      name: currentFormData.name,
      icon: iconName,
      type: currentFormData.type,
      parentCategory: currentFormData.parentCategory,
    });

    // Create the category now that the form is complete
    logger.info(`Creating category: ${updatedFormData.name}`);
    await this.categoryService.createCategoryThroughUI(updatedFormData);
  }
}
