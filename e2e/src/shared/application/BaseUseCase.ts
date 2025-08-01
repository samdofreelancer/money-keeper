import { logger } from "../../support/logger";

/**
 * BaseUseCase provides a common structure for use cases with
 * flexible input parameters, structured error handling, and logging.
 */
export abstract class BaseUseCase<Input = unknown, Output = unknown> {
  abstract execute(input: Input): Promise<Output>;

  async run(input: Input): Promise<Output> {
    try {
      logger.info(
        `Executing use case: ${
          this.constructor.name
        } with input: ${JSON.stringify(input)}`
      );
      const result = await this.execute(input);
      logger.info(`Use case ${this.constructor.name} executed successfully`);
      return result;
    } catch (error) {
      logger.error(
        `Error in use case ${this.constructor.name}: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw error;
    }
  }
}
