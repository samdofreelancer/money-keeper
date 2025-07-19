import { logger } from "../../../../support/logger";
import { AccountApiClient } from "../../infrastructure/api/account-api.client";

export class AccountCleanupService {
  private accountApiClient: AccountApiClient;
  constructor(accountApiClient: AccountApiClient) {
    this.accountApiClient = accountApiClient;
  }
  async cleanupAccounts(accountIds: string[]): Promise<void> {
    if (!accountIds || accountIds.length === 0) return;
    logger.info(
      `Cleaning up ${accountIds.length} created accounts via API (by ID)`
    );
    const deletePromises = accountIds.map(async (accountId: string) => {
      try {
        await this.accountApiClient.deleteAccount(accountId);
        logger.info(`Successfully cleaned up account ID: ${accountId}`);
        return true;
      } catch (error) {
        logger.error(`Failed to cleanup account ID ${accountId}: ${error}`);
        return false;
      }
    });
    await Promise.allSettled(deletePromises);
    logger.info("Account cleanup completed");
  }
}
