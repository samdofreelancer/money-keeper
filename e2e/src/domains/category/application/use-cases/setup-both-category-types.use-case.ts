import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Setup Both Category Types
 * Handles the workflow for creating both income and expense categories for test setup
 */
export class SetupBothCategoryTypesUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing setup both category types use case");

    const expenseFormData = new CategoryFormValue({
      name: "Test Expense Category",
      icon: "Default",
      type: "EXPENSE",
    });

    const incomeFormData = new CategoryFormValue({
      name: "Test Income Category",
      icon: "Default",
      type: "INCOME",
    });

    try {
      await this.categoryService.createCategoryThroughAPI(
        expenseFormData.toCreateRequest()
      );
      await this.categoryService.createCategoryThroughAPI(
        incomeFormData.toCreateRequest()
      );
      logger.info("Successfully set up both income and expense categories");
    } catch (error) {
      // Categories might already exist
      const expenseExists = await this.categoryService.categoryExists(
        "Test Expense Category"
      );
      const incomeExists = await this.categoryService.categoryExists(
        "Test Income Category"
      );

      if (!expenseExists || !incomeExists) {
        throw new Error(
          `Failed to set up both category types: expense=${expenseExists}, income=${incomeExists}`
        );
      }
      logger.info("Both income and expense categories already exist");
    }
  }
}
