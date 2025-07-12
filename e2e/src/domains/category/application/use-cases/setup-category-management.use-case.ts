import { logger } from "../../../../shared/utils/logger";
import { config } from "../../../../shared/config/env.config";
import { CustomWorld } from "../../../../support/world";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Setup Category Management
 * Handles the complete workflow for setting up category management access
 */
export class SetupCategoryManagementUseCase {
  constructor(private world: CustomWorld) {}

  async execute(): Promise<CategoryApplicationService> {
    logger.info("Executing setup category management use case");

    // Initialize the category application service
    const categoryService = new CategoryApplicationService(
      this.world.page,
      this.world
    );
    this.world.categoryService = categoryService;

    // Navigate to categories page
    const baseUrl = config.browser.baseUrl || "http://localhost:5173";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const categoriesUrl = `${cleanBaseUrl}/categories`;

    try {
      await this.world.page.goto(categoriesUrl);
      await this.world.page.waitForLoadState("networkidle");
      logger.info(
        `Successfully navigated to categories page at ${categoriesUrl}`
      );
      return categoryService;
    } catch (error) {
      logger.error(
        `Failed to navigate to categories page: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new Error(
        `Cannot access category management features at ${categoriesUrl}. Please ensure the application is running.`
      );
    }
  }
}
