import {
  Before,
  After,
  AfterStep,
  ITestCaseHookParameter,
  Status,
  World,
} from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";

import { CustomWorld } from "./world";
import { logger } from "./logger";
import { CategoryPage } from "../domains/category/infra/pages/CategoryPage";
import {
  deleteCategory,
  getAllCategories,
  Category,
} from "../api/categoryApiHelper";
import { config } from "../config/env.config";

// Before Hook
Before(async function (this: CustomWorld, { pickle }) {
  logger.info(
    `Before scenario: Launching browser for scenario "${pickle.name}"`
  );

  await this.launchBrowser();
  this.categoryPage = new CategoryPage(this.page);
  
  // Clear all categories before each test for clean state
  try {
    const { CategoryService } = await import("../domains/category/services/CategoryService");
    const categoryService = new CategoryService(this.page, this);
    await categoryService.clearAllCategories();
    logger.info("Test environment prepared with clean state");
  } catch (error) {
    logger.error("Error preparing test environment:", error);
  }

  // Capture browser console logs and output to test logs with scenario name
  if (this.page) {
    this.page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      logger.info(`Browser console [${type}] [${pickle.name}]: ${text}`);
    });
  }

  // Save environment info to JSON file for report metadata
  try {
    const envInfo = await this.getEnvironmentInfo();
    const reportsDir = path.join(__dirname, "..", "..", "metadata");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const envInfoPath = path.join(reportsDir, "environment-info.metadata.json");
    fs.writeFileSync(envInfoPath, JSON.stringify(envInfo, null, 2), "utf-8");
    logger.info(`Environment info saved to ${envInfoPath}`);
  } catch (error) {
    logger.error("Failed to save environment info:", error);
  }
});

// After Hook
After({ tags: "not @no-cleanup" }, async function (this: CustomWorld) {
  try {
    // Cleanup by ID for categories created via API
    if (this.createdCategoryIds && this.createdCategoryIds.length > 0) {
      logger.info(
        `Cleaning up ${this.createdCategoryIds.length} categories by ID.`
      );
      const deletePromises = this.createdCategoryIds.map((id) =>
        deleteCategory(id)
      );
      await Promise.all(deletePromises);
      this.createdCategoryIds = []; // Reset after cleanup
    }

    // Fallback cleanup by name for categories created via UI
    if (this.createdCategoryNames && this.createdCategoryNames.length > 0) {
      logger.info(
        `Cleaning up ${this.createdCategoryNames.length} categories by name.`
      );
      const allCategories: Category[] = await getAllCategories();
      const categoriesToDelete = allCategories.filter((category) =>
        this.createdCategoryNames.includes(category.name)
      );

      if (categoriesToDelete.length > 0) {
        const deletePromises = categoriesToDelete.map((category) =>
          deleteCategory(category.id)
        );
        await Promise.all(deletePromises);
      }
      this.createdCategoryNames = []; // Reset after cleanup
    }
  } catch (error) {
    logger.error("Error during cleanup:", error);
    // We log the error but do not rethrow, to avoid masking other test failures
  }
});

// Screenshot Hook
AfterStep(async function (
  this: World,
  { pickle, result }: ITestCaseHookParameter
) {
  if (!result) {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (result.status === Status.FAILED) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `failed-step-${pickle.name.replace(/\W+/g, "_")}-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
    logger.error(
      `Screenshot taken for failed step in scenario "${pickle.name}"`
    );
  } else if (config.screenshotOnSuccess) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `success-step-${pickle.name.replace(/\W+/g, "_")}-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
    logger.info(
      `Screenshot taken for successful step in scenario "${pickle.name}"`
    );
  }
});
