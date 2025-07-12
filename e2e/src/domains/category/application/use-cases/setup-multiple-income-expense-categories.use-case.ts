import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";

/**
 * Use Case: Setup Multiple Income and Expense Categories
 * Handles the workflow for creating multiple income and expense categories for test setup
 */
export class SetupMultipleIncomeExpenseCategoriesUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info(
      "Executing setup multiple income and expense categories use case"
    );

    // Create income categories
    const incomeCategories = ["Salary Income", "Freelance Income"];
    for (const categoryName of incomeCategories) {
      const formData = new CategoryFormValue({
        name: categoryName,
        icon: "Default",
        type: "INCOME",
      });

      try {
        await this.categoryService.createCategoryThroughAPI(
          formData.toCreateRequest()
        );
        logger.info(`Successfully created income category: ${categoryName}`);
      } catch (error) {
        // Category might already exist
        const exists = await this.categoryService.categoryExists(categoryName);
        if (!exists) {
          throw new Error(`Failed to set up income category: ${categoryName}`);
        }
        logger.info(`Income category already exists: ${categoryName}`);
      }
    }

    // Create expense categories including Food category
    const expenseCategories = ["Food Expenses", "Transport Expenses"];
    for (const categoryName of expenseCategories) {
      const formData = new CategoryFormValue({
        name: categoryName,
        icon: "Default",
        type: "EXPENSE",
      });

      try {
        await this.categoryService.createCategoryThroughAPI(
          formData.toCreateRequest()
        );
        logger.info(`Successfully created expense category: ${categoryName}`);
      } catch (error) {
        // Category might already exist
        const exists = await this.categoryService.categoryExists(categoryName);
        if (!exists) {
          throw new Error(`Failed to set up expense category: ${categoryName}`);
        }
        logger.info(`Expense category already exists: ${categoryName}`);
      }
    }

    logger.info("Successfully set up multiple income and expense categories");
  }
}
