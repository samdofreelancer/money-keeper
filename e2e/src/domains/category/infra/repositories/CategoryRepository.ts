import { Page, Locator } from "@playwright/test";

import { logger } from "../../../../support/logger";
import { config } from "../../../../config/env.config";

/**
 * Repository pattern for category data access
 * Encapsulates all category-related UI queries and state checking
 */
export class CategoryRepository {
  private page: Page;
  private actionTimeout: number;

  constructor(page: Page) {
    this.page = page;
    this.actionTimeout = config.browser.actionTimeout || 10000;
  }

  /**
   * Checks if a category is present in the UI
   */
  async isCategoryPresent(categoryName: string): Promise<boolean> {
    try {
      // Wait for category tree to load
      await this.page.waitForSelector('[data-testid="category-tree"]', {
        timeout: this.actionTimeout,
      });
      
      await this.page.waitForTimeout(1000);
      const categoryLocator = this.getCategoryLocator(categoryName);
      const count = await categoryLocator.count();
      logger.info(`Category "${categoryName}" found: ${count} matches`);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking category presence: ${error}`);
      return false;
    }
  }

  /**
   * Waits for a category to appear in the UI
   */
  async waitForCategoryToAppear(categoryName: string): Promise<void> {
    logger.info(`Waiting for category "${categoryName}" to appear`);
    
    // First wait for the category tree to be ready
    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: this.actionTimeout,
    });
    
    // Give some time for the backend to process and UI to update
    await this.page.waitForTimeout(2000);
    
    // Now wait for the specific category
    const categoryLocator = this.getCategoryLocator(categoryName);
    await categoryLocator.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
    logger.info(`Category "${categoryName}" appeared successfully`);
  }

  /**
   * Waits for a category to disappear from the UI
   */
  async waitForCategoryToDisappear(categoryName: string): Promise<void> {
    const categoryLocator = this.getCategoryLocator(categoryName);
    await categoryLocator.waitFor({
      state: "hidden",
      timeout: this.actionTimeout,
    });
    logger.info(`Category "${categoryName}" disappeared`);
  }

  /**
   * Gets the count of visible categories
   */
  async getCategoryCount(): Promise<number> {
    const categoryItems = this.page.locator(
      '[data-testid="tree-node-content"]'
    );
    return await categoryItems.count();
  }

  /**
   * Gets all visible category names
   */
  async getVisibleCategoryNames(): Promise<string[]> {
    const categoryItems = this.page.locator(
      '[data-testid="tree-node-content"]'
    );
    const count = await categoryItems.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const name = await categoryItems.nth(i).textContent();
      if (name) {
        names.push(name.trim());
      }
    }

    return names;
  }

  /**
   * Checks if the category tree is loaded
   */
  async isCategoryTreeLoaded(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="category-tree"]', {
        timeout: this.actionTimeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  private getCategoryLocator(categoryName: string): Locator {
    return this.page.locator('[data-testid="tree-node-content"]', {
      hasText: categoryName,
    });
  }
}
