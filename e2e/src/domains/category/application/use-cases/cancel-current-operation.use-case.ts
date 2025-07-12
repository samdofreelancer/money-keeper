import { logger } from "../../../../shared/utils/logger";
import { CategoryApplicationService } from "../services/category-application.service";

/**
 * Use Case: Cancel Current Operation
 * Handles the workflow for cancelling the current category operation
 */
export class CancelCurrentOperationUseCase {
  constructor(private categoryService: CategoryApplicationService) {}

  async execute(): Promise<void> {
    logger.info("Executing cancel current operation use case");

    await this.categoryService.cancelCurrentOperation();
  }
}
