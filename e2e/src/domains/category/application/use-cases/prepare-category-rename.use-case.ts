import { logger } from "../../../../shared/utils/logger";
import { CustomWorld } from "../../../../support/world";

/**
 * Use Case: Prepare Category Rename
 * Handles the workflow for preparing category rename by setting up the new name
 */
export class PrepareCategoryRenameUseCase {
  constructor(private world: CustomWorld) {}

  async execute(newName: string): Promise<void> {
    logger.info(`Executing prepare category rename use case to: ${newName}`);

    this.world.newCategoryName = newName;

    logger.info("Successfully prepared category rename");
  }
}
