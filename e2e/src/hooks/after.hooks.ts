import {
  After,
  AfterAll,
  World,
  ITestCaseHookParameter,
} from "@cucumber/cucumber";

import { logger } from "../support/logger";
import {
  getAllCategories,
  deleteCategory,
  Category,
} from "../api/categoryApiHelper";

const createdCategoryNamesGlobal: string[] = [];

After(async function (
  this: World & { createdCategoryNames?: string[] },
  { pickle, result }: ITestCaseHookParameter
) {
  logger.info(
    `After scenario: Closing browser for scenario "${pickle.name}" with status ${result?.status}`
  );

  // Accumulate created category names globally for cleanup after all scenarios
  if (this.createdCategoryNames && this.createdCategoryNames.length > 0) {
    createdCategoryNamesGlobal.push(...this.createdCategoryNames);
  }

  await this.closeBrowser();
});

AfterAll(async function (this: World) {
  logger.info("AfterAll: Cleaning up categories and closing browser");

  if (createdCategoryNamesGlobal.length > 0) {
    try {
      const allCategories: Category[] = await getAllCategories();
      for (const name of createdCategoryNamesGlobal) {
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
    }
  }
});
