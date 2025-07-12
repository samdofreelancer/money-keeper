import { logger } from "../../../../shared/utils/logger";
import { config } from "../../../../shared/config/env.config";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Navigate to Application
 * Handles the workflow for navigating to the Money Keeper application
 */
export class NavigateToApplicationUseCase {
  constructor(private world: CustomWorld) {}

  async execute(): Promise<void> {
    logger.info("Executing navigate to application use case");

    const baseUrl = config.browser.baseUrl || "http://localhost:5173";
    await this.world.page.goto(baseUrl);
    logger.info(`Navigated to Money Keeper application at ${baseUrl}`);
  }
}
