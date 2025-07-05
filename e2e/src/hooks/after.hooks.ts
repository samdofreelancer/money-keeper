import { After } from "@cucumber/cucumber";

import { CustomWorld } from "../support/world";
import {
  deleteCategory,
  getAllCategories,
  Category,
} from "../api/categoryApiHelper";
import { logger } from "../support/logger";
import { getAccountByName, deleteAccountById } from "../api/accountApiHelper";

// --- Category cleanup logic ---
async function cleanupCategories(world: CustomWorld) {
  // Cleanup by ID for categories created via API
  if (world.createdCategoryIds && world.createdCategoryIds.length > 0) {
    logger.info(
      `Cleaning up ${world.createdCategoryIds.length} categories by ID.`
    );
    const deletePromises = world.createdCategoryIds.map((id) =>
      deleteCategory(id)
    );
    await Promise.all(deletePromises);
    world.createdCategoryIds = []; // Reset after cleanup
  }

  // Fallback cleanup by name for categories created via UI
  if (world.createdCategoryNames && world.createdCategoryNames.length > 0) {
    logger.info(
      `Cleaning up ${world.createdCategoryNames.length} categories by name.`
    );
    const allCategories: Category[] = await getAllCategories();
    const categoriesToDelete = allCategories.filter((category) =>
      world.createdCategoryNames.includes(category.name)
    );

    if (categoriesToDelete.length > 0) {
      const deletePromises = categoriesToDelete.map((category) =>
        deleteCategory(category.id)
      );
      await Promise.all(deletePromises);
    }
    world.createdCategoryNames = []; // Reset after cleanup
  }
}

// --- Account cleanup logic ---
async function cleanupAccounts(world: CustomWorld) {
  if (world.cleanupAccountNames && world.cleanupAccountNames.size > 0) {
    for (const name of world.cleanupAccountNames) {
      const account = await getAccountByName(name);
      if (account) {
        await deleteAccountById(account.id);
        logger.info(`Deleted account: ${name} (id: ${account.id})`);
      }
    }
    world.cleanupAccountNames.clear();
  }
}

After({ tags: "not @no-cleanup" }, async function (this: CustomWorld) {
  try {
    await cleanupCategories(this);
    await cleanupAccounts(this);
  } catch (error) {
    logger.error("Error during cleanup:", error);
    // We log the error but do not rethrow, to avoid masking other test failures
  }
});
