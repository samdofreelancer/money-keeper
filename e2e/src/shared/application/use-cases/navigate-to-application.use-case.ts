import { BaseUseCase } from "../BaseUseCase";
import { CustomWorld } from "../../../support/world";
import { logger } from "../../../support/logger";
import { config } from "../../../shared/config/env.config";


/**
 * Use case to navigate to the Money Keeper application
 */
export class NavigateToApplicationUseCase extends BaseUseCase<void, void> {
  private world: CustomWorld;

  constructor(world: CustomWorld) {
    super();
    this.world = world;
  }

  async execute(): Promise<void> {
        logger.info("Executing navigate to application use case");
    
        const baseUrl = config.browser.baseUrl || "http://localhost:5173";
        await this.world.page.goto(baseUrl);
        logger.info(`Navigated to Money Keeper application at ${baseUrl}`);
  }
}
