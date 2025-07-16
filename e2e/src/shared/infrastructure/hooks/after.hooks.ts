import { After } from "@cucumber/cucumber";

import { CustomWorld } from "../../../support/world";
import { logger } from "../../../support/logger";
import { AccountApiClient } from "../../../domains/account/infrastructure/api/account-api.client";

After({ tags: "not @no-cleanup" }, async function (this: CustomWorld) {
  try {
    // Account cleanup via API (by ID)
    if (this.createdAccountIds && this.createdAccountIds.length > 0) {
      logger.info(
        `Cleaning up ${this.createdAccountIds.length} created accounts via API (by ID)`
      );

      const accountApiClient = new AccountApiClient({
        baseURL: process.env.API_BASE_URL || "http://127.0.0.1:8080/api",
      });

      const deletePromises = this.createdAccountIds.map(
        async (accountId: string) => {
          try {
            await accountApiClient.deleteAccount(accountId);
            logger.info(`Successfully cleaned up account ID: ${accountId}`);
            return true;
          } catch (error) {
            logger.error(`Failed to cleanup account ID ${accountId}: ${error}`);
            return false;
          }
        }
      );

      await Promise.allSettled(deletePromises);

      // Clear the tracking arrays
      this.createdAccountIds = [];
      this.createdAccountNames = []; // Also clear names for safety
      logger.info("Account cleanup completed");
    }
  } catch (error) {
    logger.error("Error during cleanup:", error);
    // We log the error but do not rethrow, to avoid masking other test failures
  }
});
