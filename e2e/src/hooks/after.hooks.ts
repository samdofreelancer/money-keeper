import { After, World, ITestCaseHookParameter } from "@cucumber/cucumber";

import { logger } from "../support/logger";
import {
  getAllCategories,
  deleteCategory,
  Category,
} from "../api/categoryApiHelper";

After(async function (
  this: World & { createdCategoryNames?: string[] },
  { pickle, result }: ITestCaseHookParameter
) {
  logger.info(
    `After scenario: Closing browser for scenario "${pickle.name}" with status ${result?.status}`
  );

  // Cleanup created categories after each scenario
  if (this.createdCategoryNames && this.createdCategoryNames.length > 0) {
    try {
      const allCategories: Category[] = await getAllCategories();
      for (const name of this.createdCategoryNames) {
        const category = allCategories.find(
          (cat: Category) => cat.name === name
        );
        if (category) {
          logger.info(`Deleting category "${name}" with id ${category.id}`);
          await deleteCategory(category.id);
        }
      }
    } catch (error) {
      logger.error(`Error during category cleanup: ${error}`);
      // Fail the test suite on cleanup errors for stricter reliability
      throw error;
    }
  }

  await this.closeBrowser();
});
