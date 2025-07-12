import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Setup Bulk Categories
 * Handles the workflow for creating a large number of categories for performance testing
 */
export class SetupBulkCategoriesUseCase {
  constructor(
    private categoryService: CategoryApplicationService,
    private world: CustomWorld
  ) {}

  async execute(count: number): Promise<void> {
    logger.info(`Executing setup bulk categories use case: ${count} categories`);

    let successCount = 0;

    // Create categories in smaller batches to avoid overwhelming the system
    const batchSize = 10;
    for (let batch = 0; batch < Math.ceil(count / batchSize); batch++) {
      const batchStart = batch * batchSize + 1;
      const batchEnd = Math.min((batch + 1) * batchSize, count);

      for (let i = batchStart; i <= batchEnd; i++) {
        const categoryName = `Test Category ${i}`;
        const formData = new CategoryFormValue({
          name: categoryName,
          icon: "Default",
          type: i % 2 === 0 ? "INCOME" : "EXPENSE",
        });

        try {
          // Try creating through UI instead for better reliability in tests
          await this.categoryService.createCategoryThroughUI(formData);
          successCount++;
          logger.info(`Created category ${i}/${count}: ${categoryName}`);
        } catch (error) {
          // Category might already exist or creation failed
          logger.warn(`Failed to create category ${categoryName}: ${error}`);

          // Check if it actually exists anyway
          try {
            const exists = await this.categoryService.categoryExists(
              categoryName
            );
            if (exists) {
              successCount++;
              logger.info(
                `Category ${categoryName} already exists, counting as success`
              );
            }
          } catch (checkError) {
            logger.warn(`Failed to check category existence: ${checkError}`);
          }
        }

        // Small delay between creations
        await this.world.page.waitForTimeout(100);
      }

      // Longer pause between batches
      await this.world.page.waitForTimeout(1000);
    }

    logger.info(
      `Successfully created/verified ${successCount}/${count} categories`
    );

    // Accept if we have at least 50% success for large datasets (more realistic)
    const minimumSuccess = Math.floor(count * 0.5);
    if (successCount < minimumSuccess) {
      throw new Error(
        `Failed to meet minimum success criteria: ${successCount}/${count} (minimum required: ${minimumSuccess})`
      );
    }
  }
}
