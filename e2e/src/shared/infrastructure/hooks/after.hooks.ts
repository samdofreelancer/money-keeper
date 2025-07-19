import { After } from "@cucumber/cucumber";

import { CustomWorld } from "../../../support/world";
import { logger } from "../../../support/logger";

import { AccountApiClient } from "../../../domains/account/infrastructure/api/account-api.client";
import { CategoryApiClient } from "../../../domains/category/infrastructure/api/category-api.client";

import { CategoryCleanupService } from "../../../domains/category/application/services/cleanup.service";
import { AccountCleanupService } from "../../../domains/account/application/services/cleanup.service";


After({ tags: "not @no-cleanup" }, async function (this: CustomWorld) {
  try {
    const baseURL = process.env.API_BASE_URL || "http://127.0.0.1:8080/api";
    const accountApiClient = new AccountApiClient({ baseURL });
    const categoryApiClient = new CategoryApiClient({ baseURL });
    const accountCleanupService = new AccountCleanupService(accountApiClient);
    const categoryCleanupService = new CategoryCleanupService(categoryApiClient);

    // Clean up categories first (to avoid FK issues if any)
    await categoryCleanupService.cleanupCategories(this.createdCategoryIds, this.createdParentCategoryIds);
    this.createdCategoryIds = [];
    this.createdCategoryNames = [];

    // Clean up accounts
    await accountCleanupService.cleanupAccounts(this.createdAccountIds);
    this.createdAccountIds = [];
    this.createdAccountNames = [];
  } catch (error) {
    logger.error("Error during cleanup:", error);
    // We log the error but do not rethrow, to avoid masking other test failures
  }
});
