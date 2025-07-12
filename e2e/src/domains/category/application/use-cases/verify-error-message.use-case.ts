import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Verify Error Message
 * Handles the workflow for verifying that an expected error message was displayed
 */
export class VerifyErrorMessageUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(expectedMessage: string): Promise<void> {
    logger.info(`Executing verify error message use case: ${expectedMessage}`);

    await this.categoryService.verifyErrorMessage(expectedMessage);
  }
}
